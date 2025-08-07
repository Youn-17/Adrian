import express from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticateToken, AuthRequest } from '../middleware/auth.js'
import { MetaAnalysisService } from '../services/metaAnalysisService.js'

const router = express.Router()

// Meta分析统计函数（保留向后兼容）
class MetaAnalysis {
  // 计算效应量（Cohen's d）
  static calculateCohenD(mean1: number, mean2: number, sd1: number, sd2: number, n1: number, n2: number): number {
    const pooledSD = Math.sqrt(((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2))
    return (mean1 - mean2) / pooledSD
  }

  // 计算效应量的方差
  static calculateVariance(n1: number, n2: number, d: number): number {
    return ((n1 + n2) / (n1 * n2)) + (d * d) / (2 * (n1 + n2))
  }

  // 计算权重（逆方差权重）
  static calculateWeight(variance: number): number {
    return 1 / variance
  }

  // 固定效应模型
  static fixedEffectModel(effectSizes: number[], variances: number[]) {
    const weights = variances.map(v => this.calculateWeight(v))
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    
    const weightedEffectSum = effectSizes.reduce((sum, es, i) => sum + es * weights[i], 0)
    const pooledEffect = weightedEffectSum / totalWeight
    
    const pooledVariance = 1 / totalWeight
    const pooledSE = Math.sqrt(pooledVariance)
    
    const zValue = pooledEffect / pooledSE
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zValue)))
    
    const ci95Lower = pooledEffect - 1.96 * pooledSE
    const ci95Upper = pooledEffect + 1.96 * pooledSE
    
    return {
      pooledEffect,
      standardError: pooledSE,
      zValue,
      pValue,
      confidenceInterval: [ci95Lower, ci95Upper],
      weights
    }
  }

  // 随机效应模型
  static randomEffectModel(effectSizes: number[], variances: number[]) {
    // 首先计算固定效应
    const fixedResult = this.fixedEffectModel(effectSizes, variances)
    
    // 计算Q统计量
    const weights = variances.map(v => this.calculateWeight(v))
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    
    const Q = effectSizes.reduce((sum, es, i) => {
      const diff = es - fixedResult.pooledEffect
      return sum + weights[i] * diff * diff
    }, 0)
    
    const df = effectSizes.length - 1
    const tau2 = Math.max(0, (Q - df) / (totalWeight - weights.reduce((sum, w) => sum + w * w, 0) / totalWeight))
    
    // 重新计算权重
    const randomWeights = variances.map(v => 1 / (v + tau2))
    const totalRandomWeight = randomWeights.reduce((sum, w) => sum + w, 0)
    
    const weightedEffectSum = effectSizes.reduce((sum, es, i) => sum + es * randomWeights[i], 0)
    const pooledEffect = weightedEffectSum / totalRandomWeight
    
    const pooledVariance = 1 / totalRandomWeight
    const pooledSE = Math.sqrt(pooledVariance)
    
    const zValue = pooledEffect / pooledSE
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zValue)))
    
    const ci95Lower = pooledEffect - 1.96 * pooledSE
    const ci95Upper = pooledEffect + 1.96 * pooledSE
    
    return {
      pooledEffect,
      standardError: pooledSE,
      zValue,
      pValue,
      confidenceInterval: [ci95Lower, ci95Upper],
      tau2,
      Q,
      df,
      weights: randomWeights,
      heterogeneity: {
        Q,
        df,
        pValue: 1 - this.chiSquareCDF(Q, df),
        I2: Math.max(0, (Q - df) / Q) * 100
      }
    }
  }

  // 标准正态分布累积分布函数
  static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)))
  }

  // 误差函数近似
  static erf(x: number): number {
    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911
    
    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)
    
    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
    
    return sign * y
  }

  // 卡方分布累积分布函数（简化版）
  static chiSquareCDF(x: number, df: number): number {
    if (x <= 0) return 0
    if (df === 1) return 2 * this.normalCDF(Math.sqrt(x)) - 1
    if (df === 2) return 1 - Math.exp(-x / 2)
    
    // 对于其他自由度，使用近似
    const mean = df
    const variance = 2 * df
    const normalizedX = (x - mean) / Math.sqrt(variance)
    return this.normalCDF(normalizedX)
  }
}

// 创建新的Meta分析
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { 
      project_id, 
      name, 
      description, 
      analysis_type = 'random_effect',
      dataset_ids = [],
      effect_size_column,
      variance_column,
      study_column
    } = req.body

    if (!project_id || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Project ID and analysis name are required' 
      })
    }

    // 验证项目所有权
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', project_id)
      .eq('user_id', req.user!.id)
      .single()

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      })
    }

    // 创建分析记录
    const { data: newAnalysis, error } = await supabase
      .from('analyses')
      .insert({
        project_id,
        name,
        description,
        analysis_type,
        dataset_ids,
        parameters: {
          effect_size_column,
          variance_column,
          study_column
        },
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Create analysis error:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to create analysis' 
      })
    }

    res.status(201).json({
      success: true,
      analysis: newAnalysis
    })
  } catch (error) {
    console.error('Create analysis error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// 运行Meta分析
router.post('/:id/run', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // 验证分析所有权
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user!.id)
      .single()

    if (fetchError || !analysis) {
      return res.status(404).json({ 
        success: false, 
        error: 'Analysis not found' 
      })
    }

    if (analysis.status === 'running') {
      return res.status(400).json({ 
        success: false, 
        error: 'Analysis is already running' 
      })
    }

    // 更新状态为运行中
    await supabase
      .from('analyses')
      .update({ status: 'running' })
      .eq('id', id)

    try {
      // 获取数据集
      const { data: datasets, error: datasetError } = await supabase
        .from('datasets')
        .select('*')
        .in('id', analysis.dataset_ids || [])
        .eq('status', 'processed')

      if (datasetError || !datasets || datasets.length === 0) {
        throw new Error('No valid datasets found for analysis')
      }

      // 合并所有数据集的数据
      let allData: any[] = []
      for (const dataset of datasets) {
        if (dataset.data && Array.isArray(dataset.data)) {
          allData = allData.concat(dataset.data)
        }
      }

      if (allData.length === 0) {
        throw new Error('No data found in datasets')
      }

      const parameters = analysis.parameters || {}
      const effectSizeColumn = parameters.effect_size_column
      const varianceColumn = parameters.variance_column
      const studyColumn = parameters.study_column

      if (!effectSizeColumn) {
        throw new Error('Effect size column not specified')
      }

      // 提取效应量和方差
      const validData = allData.filter(row => {
        const effectSize = parseFloat(row[effectSizeColumn])
        const variance = varianceColumn ? parseFloat(row[varianceColumn]) : null
        return !isNaN(effectSize) && (variance === null || !isNaN(variance))
      })

      if (validData.length < 2) {
        throw new Error('At least 2 valid studies are required for meta-analysis')
      }

      const effectSizes = validData.map(row => parseFloat(row[effectSizeColumn]))
      let variances: number[]

      if (varianceColumn) {
        variances = validData.map(row => parseFloat(row[varianceColumn]))
      } else {
        // 如果没有方差列，使用默认方差估计
        variances = effectSizes.map(() => 0.1) // 简化处理
      }

      // 执行Meta分析
      let results: any
      if (analysis.analysis_type === 'fixed_effect') {
        results = MetaAnalysisService.fixedEffectModel(effectSizes, variances)
      } else {
        results = MetaAnalysisService.randomEffectModel(effectSizes, variances)
      }

      // 执行附加分析
      const standardErrors = variances.map(v => Math.sqrt(v))
      let publicationBias = null
      let sensitivityAnalysis = null
      let subgroupAnalysis = null

      try {
        // 发表偏倚检验
        if (effectSizes.length >= 10) {
          publicationBias = await MetaAnalysisService.publicationBiasTest(effectSizes, standardErrors)
        }

        // 敏感性分析
        if (effectSizes.length >= 3) {
          sensitivityAnalysis = MetaAnalysisService.sensitivityAnalysis(effectSizes, variances)
        }

        // 亚组分析（如果有分组变量）
        const groupVariable = analysis.parameters?.subgroup_variable
        if (groupVariable && validData.some(row => row[groupVariable])) {
          const studiesWithGroup = validData.map((row, index) => ({
            id: `study_${index + 1}`,
            name: studyColumn ? row[studyColumn] : `Study ${index + 1}`,
            effectSize: effectSizes[index],
            variance: variances[index],
            [groupVariable]: row[groupVariable]
          }))
          subgroupAnalysis = MetaAnalysisService.subgroupAnalysis(studiesWithGroup, groupVariable)
        }
      } catch (analysisError) {
        console.warn('Additional analysis failed:', analysisError)
      }

      // 准备研究信息
      const studies = validData.map((row, index) => ({
        id: index + 1,
        name: studyColumn ? row[studyColumn] : `Study ${index + 1}`,
        effectSize: effectSizes[index],
        variance: variances[index],
        weight: results.weights[index],
        confidenceInterval: [
          effectSizes[index] - 1.96 * Math.sqrt(variances[index]),
          effectSizes[index] + 1.96 * Math.sqrt(variances[index])
        ]
      }))

      // 保存结果
      const { data: newResult, error: resultError } = await supabase
        .from('results')
        .insert({
          analysis_id: id,
          result_type: 'meta_analysis',
          data: {
            ...results,
            studies,
            publicationBias,
            sensitivityAnalysis,
            subgroupAnalysis,
            summary: {
              totalStudies: validData.length,
              analysisType: analysis.analysis_type,
              effectSizeColumn,
              varianceColumn,
              hasPublicationBiasTest: publicationBias !== null,
              hasSensitivityAnalysis: sensitivityAnalysis !== null,
              hasSubgroupAnalysis: subgroupAnalysis !== null
            }
          }
        })
        .select()
        .single()

      if (resultError) {
        throw resultError
      }

      // 更新分析状态
      await supabase
        .from('analyses')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', id)

      res.json({
        success: true,
        message: 'Analysis completed successfully',
        result: newResult
      })
    } catch (analysisError) {
      // 更新状态为失败
      await supabase
        .from('analyses')
        .update({ 
          status: 'failed',
          error_message: analysisError.message
        })
        .eq('id', id)

      console.error('Analysis execution error:', analysisError)
      res.status(500).json({ 
        success: false, 
        error: `Analysis failed: ${analysisError.message}` 
      })
    }
  } catch (error) {
    console.error('Run analysis error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// 获取项目的所有分析
router.get('/project/:projectId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params

    // 验证项目所有权
    const { data: project } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', req.user!.id)
      .single()

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        error: 'Project not found' 
      })
    }

    const { data: analyses, error } = await supabase
      .from('analyses')
      .select(`
        *,
        results(count)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get analyses error:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch analyses' 
      })
    }

    res.json({
      success: true,
      analyses
    })
  } catch (error) {
    console.error('Get analyses error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// 获取分析详情
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data: analysis, error } = await supabase
      .from('analyses')
      .select(`
        *,
        projects!inner(user_id),
        results(*)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user!.id)
      .single()

    if (error || !analysis) {
      return res.status(404).json({ 
        success: false, 
        error: 'Analysis not found' 
      })
    }

    res.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error('Get analysis error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// 获取分析结果
router.get('/:id/results', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // 验证分析所有权
    const { data: analysis } = await supabase
      .from('analyses')
      .select(`
        id,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user!.id)
      .single()

    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        error: 'Analysis not found' 
      })
    }

    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .eq('analysis_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get results error:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch results' 
      })
    }

    res.json({
      success: true,
      results
    })
  } catch (error) {
    console.error('Get results error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// 删除分析
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // 验证分析所有权
    const { data: analysis } = await supabase
      .from('analyses')
      .select(`
        id,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user!.id)
      .single()

    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        error: 'Analysis not found' 
      })
    }

    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete analysis error:', error)
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to delete analysis' 
      })
    }

    res.json({
      success: true,
      message: 'Analysis deleted successfully'
    })
  } catch (error) {
    console.error('Delete analysis error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// 发表偏倚检验
router.post('/:id/publication-bias', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // 验证分析所有权
    const { data: analysis } = await supabase
      .from('analyses')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user!.id)
      .single()

    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        error: 'Analysis not found' 
      })
    }

    // 获取最新结果
    const { data: result } = await supabase
      .from('results')
      .select('data')
      .eq('analysis_id', id)
      .eq('result_type', 'meta_analysis')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!result || !result.data.studies) {
      return res.status(400).json({ 
        success: false, 
        error: 'No analysis results found' 
      })
    }

    const studies = result.data.studies
    if (studies.length < 10) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least 10 studies required for publication bias test' 
      })
    }

    const effectSizes = studies.map((s: any) => s.effectSize)
    const standardErrors = studies.map((s: any) => Math.sqrt(s.variance))

    const biasResult = await MetaAnalysisService.publicationBiasTest(effectSizes, standardErrors)

    res.json({
      success: true,
      publicationBias: biasResult
    })
  } catch (error) {
    console.error('Publication bias test error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// 亚组分析
router.post('/:id/subgroup', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { groupVariable } = req.body

    if (!groupVariable) {
      return res.status(400).json({ 
        success: false, 
        error: 'Group variable is required' 
      })
    }

    // 验证分析所有权
    const { data: analysis } = await supabase
      .from('analyses')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user!.id)
      .single()

    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        error: 'Analysis not found' 
      })
    }

    // 获取原始数据
    const { data: datasets } = await supabase
      .from('datasets')
      .select('data')
      .in('id', analysis.dataset_ids || [])
      .eq('status', 'processed')

    if (!datasets || datasets.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No datasets found' 
      })
    }

    // 合并数据
    let allData: any[] = []
    for (const dataset of datasets) {
      if (dataset.data && Array.isArray(dataset.data)) {
        allData = allData.concat(dataset.data)
      }
    }

    const parameters = analysis.parameters || {}
    const effectSizeColumn = parameters.effect_size_column
    const varianceColumn = parameters.variance_column
    const studyColumn = parameters.study_column

    // 准备亚组分析数据
    const validData = allData.filter(row => {
      const effectSize = parseFloat(row[effectSizeColumn])
      const hasGroupValue = row[groupVariable] !== undefined && row[groupVariable] !== null
      return !isNaN(effectSize) && hasGroupValue
    })

    if (validData.length < 4) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least 4 studies with group variable are required' 
      })
    }

    const studiesWithGroup = validData.map((row, index) => ({
      id: `study_${index + 1}`,
      name: studyColumn ? row[studyColumn] : `Study ${index + 1}`,
      effectSize: parseFloat(row[effectSizeColumn]),
      variance: varianceColumn ? parseFloat(row[varianceColumn]) : 0.1,
      [groupVariable]: row[groupVariable]
    }))

    const subgroupResult = MetaAnalysisService.subgroupAnalysis(studiesWithGroup, groupVariable)

    res.json({
      success: true,
      subgroupAnalysis: subgroupResult
    })
  } catch (error) {
    console.error('Subgroup analysis error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// 敏感性分析
router.post('/:id/sensitivity', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // 验证分析所有权
    const { data: analysis } = await supabase
      .from('analyses')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user!.id)
      .single()

    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        error: 'Analysis not found' 
      })
    }

    // 获取最新结果
    const { data: result } = await supabase
      .from('results')
      .select('data')
      .eq('analysis_id', id)
      .eq('result_type', 'meta_analysis')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!result || !result.data.studies) {
      return res.status(400).json({ 
        success: false, 
        error: 'No analysis results found' 
      })
    }

    const studies = result.data.studies
    if (studies.length < 3) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least 3 studies required for sensitivity analysis' 
      })
    }

    const effectSizes = studies.map((s: any) => s.effectSize)
    const variances = studies.map((s: any) => s.variance)

    const sensitivityResult = MetaAnalysisService.sensitivityAnalysis(effectSizes, variances)

    res.json({
      success: true,
      sensitivityAnalysis: sensitivityResult
    })
  } catch (error) {
    console.error('Sensitivity analysis error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    })
  }
})

// Python高级分析
router.post('/:id/python-analysis', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { analysisType = 'random_effect' } = req.body

    // 验证分析所有权
    const { data: analysis } = await supabase
      .from('analyses')
      .select(`
        *,
        projects!inner(user_id)
      `)
      .eq('id', id)
      .eq('projects.user_id', req.user!.id)
      .single()

    if (!analysis) {
      return res.status(404).json({ 
        success: false, 
        error: 'Analysis not found' 
      })
    }

    // 获取最新结果
    const { data: result } = await supabase
      .from('results')
      .select('data')
      .eq('analysis_id', id)
      .eq('result_type', 'meta_analysis')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!result || !result.data.studies) {
      return res.status(400).json({ 
        success: false, 
        error: 'No analysis results found' 
      })
    }

    const studies = result.data.studies
    const pythonResult = await MetaAnalysisService.runPythonAnalysis(studies, analysisType)

    res.json({
      success: true,
      pythonAnalysis: pythonResult
    })
  } catch (error) {
    console.error('Python analysis error:', error)
    res.status(500).json({ 
      success: false, 
      error: `Python analysis failed: ${error.message}` 
    })
  }
})

export default router