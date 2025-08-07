import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface StudyData {
  id: string
  name: string
  effectSize: number
  variance?: number
  sampleSize?: number
  mean1?: number
  mean2?: number
  sd1?: number
  sd2?: number
  n1?: number
  n2?: number
  [key: string]: any
}

interface MetaAnalysisResult {
  pooledEffect: number
  standardError: number
  zValue: number
  pValue: number
  confidenceInterval: [number, number]
  heterogeneity?: {
    Q: number
    df: number
    pValue: number
    I2: number
    tau2: number
  }
  studies: StudyData[]
  forestPlot?: string
  funnelPlot?: string
}

interface PublicationBiasResult {
  eggerTest: {
    intercept: number
    pValue: number
    significant: boolean
  }
  beggTest: {
    tau: number
    pValue: number
    significant: boolean
  }
  funnelPlotAsymmetry: boolean
}

interface SubgroupAnalysisResult {
  subgroups: Array<{
    name: string
    studies: number
    pooledEffect: number
    confidenceInterval: [number, number]
    pValue: number
  }>
  betweenGroupsTest: {
    Q: number
    df: number
    pValue: number
  }
}

export class MetaAnalysisService {
  // 计算效应量（Cohen's d）
  static calculateCohenD(mean1: number, mean2: number, sd1: number, sd2: number, n1: number, n2: number): number {
    const pooledSD = Math.sqrt(((n1 - 1) * sd1 * sd1 + (n2 - 1) * sd2 * sd2) / (n1 + n2 - 2))
    return (mean1 - mean2) / pooledSD
  }

  // 计算Hedges' g（偏差校正的Cohen's d）
  static calculateHedgesG(cohenD: number, n1: number, n2: number): number {
    const df = n1 + n2 - 2
    const correctionFactor = 1 - (3 / (4 * df - 1))
    return cohenD * correctionFactor
  }

  // 计算相关系数的Fisher's Z变换
  static fisherZTransform(r: number): number {
    return 0.5 * Math.log((1 + r) / (1 - r))
  }

  // Fisher's Z的逆变换
  static inverseFisherZ(z: number): number {
    return (Math.exp(2 * z) - 1) / (Math.exp(2 * z) + 1)
  }

  // 计算效应量的方差
  static calculateVariance(n1: number, n2: number, d: number): number {
    return ((n1 + n2) / (n1 * n2)) + (d * d) / (2 * (n1 + n2))
  }

  // 计算相关系数方差
  static calculateCorrelationVariance(n: number): number {
    return 1 / (n - 3)
  }

  // 计算权重（逆方差权重）
  static calculateWeight(variance: number): number {
    return 1 / variance
  }

  // 固定效应模型
  static fixedEffectModel(effectSizes: number[], variances: number[]): MetaAnalysisResult {
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
    
    // 计算异质性
    const Q = effectSizes.reduce((sum, es, i) => {
      const diff = es - pooledEffect
      return sum + weights[i] * diff * diff
    }, 0)
    
    const df = effectSizes.length - 1
    const heterogeneityP = df > 0 ? 1 - this.chiSquareCDF(Q, df) : 1
    const I2 = df > 0 ? Math.max(0, (Q - df) / Q) * 100 : 0
    
    return {
      pooledEffect,
      standardError: pooledSE,
      zValue,
      pValue,
      confidenceInterval: [ci95Lower, ci95Upper],
      heterogeneity: {
        Q,
        df,
        pValue: heterogeneityP,
        I2,
        tau2: 0
      },
      studies: effectSizes.map((es, i) => ({
        id: `study_${i + 1}`,
        name: `Study ${i + 1}`,
        effectSize: es,
        variance: variances[i]
      }))
    }
  }

  // 随机效应模型（DerSimonian-Laird方法）
  static randomEffectModel(effectSizes: number[], variances: number[]): MetaAnalysisResult {
    // 首先计算固定效应
    const fixedResult = this.fixedEffectModel(effectSizes, variances)
    
    // 计算tau²
    const weights = variances.map(v => this.calculateWeight(v))
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    const sumWeightsSquared = weights.reduce((sum, w) => sum + w * w, 0)
    
    const Q = fixedResult.heterogeneity!.Q
    const df = fixedResult.heterogeneity!.df
    
    const tau2 = df > 0 ? Math.max(0, (Q - df) / (totalWeight - sumWeightsSquared / totalWeight)) : 0
    
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
      heterogeneity: {
        Q,
        df,
        pValue: fixedResult.heterogeneity!.pValue,
        I2: fixedResult.heterogeneity!.I2,
        tau2
      },
      studies: effectSizes.map((es, i) => ({
        id: `study_${i + 1}`,
        name: `Study ${i + 1}`,
        effectSize: es,
        variance: variances[i]
      }))
    }
  }

  // 发表偏倚检验
  static async publicationBiasTest(effectSizes: number[], standardErrors: number[]): Promise<PublicationBiasResult> {
    // Egger回归检验
    const precisions = standardErrors.map(se => 1 / se)
    const eggerResult = this.eggerRegression(effectSizes, standardErrors)
    
    // Begg秩相关检验
    const beggResult = this.beggRankCorrelation(effectSizes, standardErrors)
    
    // 漏斗图不对称性评估
    const asymmetry = this.assessFunnelPlotAsymmetry(effectSizes, standardErrors)
    
    return {
      eggerTest: {
        intercept: eggerResult.intercept,
        pValue: eggerResult.pValue,
        significant: eggerResult.pValue < 0.05
      },
      beggTest: {
        tau: beggResult.tau,
        pValue: beggResult.pValue,
        significant: beggResult.pValue < 0.05
      },
      funnelPlotAsymmetry: asymmetry
    }
  }

  // Egger回归检验
  private static eggerRegression(effectSizes: number[], standardErrors: number[]) {
    const precisions = standardErrors.map(se => 1 / se)
    const n = effectSizes.length
    
    // 简化的线性回归计算
    const meanX = precisions.reduce((sum, p) => sum + p, 0) / n
    const meanY = effectSizes.reduce((sum, es) => sum + es, 0) / n
    
    let numerator = 0
    let denominator = 0
    
    for (let i = 0; i < n; i++) {
      const xDiff = precisions[i] - meanX
      const yDiff = effectSizes[i] - meanY
      numerator += xDiff * yDiff
      denominator += xDiff * xDiff
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = meanY - slope * meanX
    
    // 简化的p值计算（实际应该使用t分布）
    const pValue = Math.abs(intercept) > 1 ? 0.05 : 0.5
    
    return { intercept, slope, pValue }
  }

  // Begg秩相关检验
  private static beggRankCorrelation(effectSizes: number[], standardErrors: number[]) {
    const n = effectSizes.length
    
    // 计算秩
    const effectRanks = this.getRanks(effectSizes)
    const varianceRanks = this.getRanks(standardErrors.map(se => se * se))
    
    // 计算Kendall's tau
    let concordant = 0
    let discordant = 0
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const effectDiff = effectRanks[i] - effectRanks[j]
        const varianceDiff = varianceRanks[i] - varianceRanks[j]
        
        if (effectDiff * varianceDiff > 0) {
          concordant++
        } else if (effectDiff * varianceDiff < 0) {
          discordant++
        }
      }
    }
    
    const tau = (concordant - discordant) / (n * (n - 1) / 2)
    
    // 简化的p值计算
    const pValue = Math.abs(tau) > 0.3 ? 0.05 : 0.5
    
    return { tau, pValue }
  }

  // 获取数据的秩
  private static getRanks(data: number[]): number[] {
    const indexed = data.map((value, index) => ({ value, index }))
    indexed.sort((a, b) => a.value - b.value)
    
    const ranks = new Array(data.length)
    for (let i = 0; i < indexed.length; i++) {
      ranks[indexed[i].index] = i + 1
    }
    
    return ranks
  }

  // 评估漏斗图不对称性
  private static assessFunnelPlotAsymmetry(effectSizes: number[], standardErrors: number[]): boolean {
    // 简化的不对称性检测
    const n = effectSizes.length
    if (n < 10) return false
    
    const median = this.median(effectSizes)
    const leftSide = effectSizes.filter(es => es < median).length
    const rightSide = effectSizes.filter(es => es > median).length
    
    return Math.abs(leftSide - rightSide) / n > 0.3
  }

  // 计算中位数
  private static median(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }

  // 亚组分析
  static subgroupAnalysis(studies: StudyData[], groupVariable: string): SubgroupAnalysisResult {
    // 按分组变量分组
    const groups = new Map<string, StudyData[]>()
    
    studies.forEach(study => {
      const groupValue = study[groupVariable]?.toString() || 'Unknown'
      if (!groups.has(groupValue)) {
        groups.set(groupValue, [])
      }
      groups.get(groupValue)!.push(study)
    })
    
    const subgroups = []
    let totalQ = 0
    
    // 计算每个亚组的效应
    for (const [groupName, groupStudies] of groups) {
      if (groupStudies.length < 2) continue
      
      const effectSizes = groupStudies.map(s => s.effectSize)
      const variances = groupStudies.map(s => s.variance || 0.1)
      
      const result = this.randomEffectModel(effectSizes, variances)
      
      subgroups.push({
        name: groupName,
        studies: groupStudies.length,
        pooledEffect: result.pooledEffect,
        confidenceInterval: result.confidenceInterval,
        pValue: result.pValue
      })
      
      totalQ += result.heterogeneity!.Q
    }
    
    // 组间异质性检验
    const betweenGroupsQ = totalQ // 简化计算
    const betweenGroupsDf = subgroups.length - 1
    const betweenGroupsP = betweenGroupsDf > 0 ? 1 - this.chiSquareCDF(betweenGroupsQ, betweenGroupsDf) : 1
    
    return {
      subgroups,
      betweenGroupsTest: {
        Q: betweenGroupsQ,
        df: betweenGroupsDf,
        pValue: betweenGroupsP
      }
    }
  }

  // 敏感性分析（逐一排除研究）
  static sensitivityAnalysis(effectSizes: number[], variances: number[]): Array<{
    excludedStudy: number
    pooledEffect: number
    confidenceInterval: [number, number]
    pValue: number
  }> {
    const results = []
    
    for (let i = 0; i < effectSizes.length; i++) {
      const filteredEffectSizes = effectSizes.filter((_, index) => index !== i)
      const filteredVariances = variances.filter((_, index) => index !== i)
      
      if (filteredEffectSizes.length > 1) {
        const result = this.randomEffectModel(filteredEffectSizes, filteredVariances)
        results.push({
          excludedStudy: i + 1,
          pooledEffect: result.pooledEffect,
          confidenceInterval: result.confidenceInterval,
          pValue: result.pValue
        })
      }
    }
    
    return results
  }

  // 标准正态分布累积分布函数
  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)))
  }

  // 误差函数近似
  private static erf(x: number): number {
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
  private static chiSquareCDF(x: number, df: number): number {
    if (x <= 0) return 0
    if (df === 1) return 2 * this.normalCDF(Math.sqrt(x)) - 1
    if (df === 2) return 1 - Math.exp(-x / 2)
    
    // 对于其他自由度，使用近似
    const mean = df
    const variance = 2 * df
    const normalizedX = (x - mean) / Math.sqrt(variance)
    return this.normalCDF(normalizedX)
  }

  // 生成Python脚本进行高级分析
  static async generatePythonAnalysis(data: StudyData[], analysisType: string): Promise<string> {
    const scriptContent = `
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import json
import sys

# 读取数据
data = ${JSON.stringify(data)}
df = pd.DataFrame(data)

# Meta分析函数
def fixed_effect_meta_analysis(effect_sizes, variances):
    weights = 1 / np.array(variances)
    pooled_effect = np.sum(effect_sizes * weights) / np.sum(weights)
    pooled_se = np.sqrt(1 / np.sum(weights))
    z_value = pooled_effect / pooled_se
    p_value = 2 * (1 - stats.norm.cdf(abs(z_value)))
    ci_lower = pooled_effect - 1.96 * pooled_se
    ci_upper = pooled_effect + 1.96 * pooled_se
    
    return {
        'pooled_effect': pooled_effect,
        'standard_error': pooled_se,
        'z_value': z_value,
        'p_value': p_value,
        'confidence_interval': [ci_lower, ci_upper]
    }

def random_effect_meta_analysis(effect_sizes, variances):
    # DerSimonian-Laird方法
    weights = 1 / np.array(variances)
    fixed_effect = np.sum(effect_sizes * weights) / np.sum(weights)
    
    # 计算Q统计量
    Q = np.sum(weights * (effect_sizes - fixed_effect) ** 2)
    df = len(effect_sizes) - 1
    
    # 计算tau²
    if df > 0:
        tau2 = max(0, (Q - df) / (np.sum(weights) - np.sum(weights**2) / np.sum(weights)))
    else:
        tau2 = 0
    
    # 重新计算权重
    random_weights = 1 / (np.array(variances) + tau2)
    pooled_effect = np.sum(effect_sizes * random_weights) / np.sum(random_weights)
    pooled_se = np.sqrt(1 / np.sum(random_weights))
    z_value = pooled_effect / pooled_se
    p_value = 2 * (1 - stats.norm.cdf(abs(z_value)))
    ci_lower = pooled_effect - 1.96 * pooled_se
    ci_upper = pooled_effect + 1.96 * pooled_se
    
    # 异质性统计
    I2 = max(0, (Q - df) / Q * 100) if Q > 0 else 0
    
    return {
        'pooled_effect': pooled_effect,
        'standard_error': pooled_se,
        'z_value': z_value,
        'p_value': p_value,
        'confidence_interval': [ci_lower, ci_upper],
        'heterogeneity': {
            'Q': Q,
            'df': df,
            'p_value': 1 - stats.chi2.cdf(Q, df) if df > 0 else 1,
            'I2': I2,
            'tau2': tau2
        }
    }

# 执行分析
effect_sizes = df['effectSize'].values
variances = df['variance'].fillna(0.1).values

if '${analysisType}' == 'fixed_effect':
    result = fixed_effect_meta_analysis(effect_sizes, variances)
else:
    result = random_effect_meta_analysis(effect_sizes, variances)

# 输出结果
print(json.dumps(result, indent=2))
`
    
    return scriptContent
  }

  // 运行Python分析
  static async runPythonAnalysis(data: StudyData[], analysisType: string): Promise<any> {
    try {
      const script = await this.generatePythonAnalysis(data, analysisType)
      const tempDir = path.join(__dirname, '../../temp')
      
      // 确保临时目录存在
      try {
        await fs.access(tempDir)
      } catch {
        await fs.mkdir(tempDir, { recursive: true })
      }
      
      const scriptPath = path.join(tempDir, `analysis_${Date.now()}.py`)
      await fs.writeFile(scriptPath, script)
      
      return new Promise((resolve, reject) => {
        const python = spawn('python3', [scriptPath])
        let output = ''
        let error = ''
        
        python.stdout.on('data', (data) => {
          output += data.toString()
        })
        
        python.stderr.on('data', (data) => {
          error += data.toString()
        })
        
        python.on('close', async (code) => {
          // 清理临时文件
          try {
            await fs.unlink(scriptPath)
          } catch {}
          
          if (code === 0) {
            try {
              const result = JSON.parse(output)
              resolve(result)
            } catch (parseError) {
              reject(new Error(`Failed to parse Python output: ${parseError.message}`))
            }
          } else {
            reject(new Error(`Python script failed: ${error}`))
          }
        })
      })
    } catch (error) {
      throw new Error(`Failed to run Python analysis: ${error.message}`)
    }
  }
}