import { Router } from 'express'
import { DataStructureService } from '../services/dataStructureService.js'
import { authenticateToken } from '../middleware/auth.js'
import multer from 'multer'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import fs from 'fs'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// 解析不同格式的文件
function parseFileData(buffer: Buffer, filename: string): any[] {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'csv':
      const csvText = buffer.toString('utf-8')
      const csvResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true
      })
      return csvResult.data as any[]
    
    case 'xlsx':
    case 'xls':
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      return XLSX.utils.sheet_to_json(worksheet)
    
    case 'txt':
      const txtText = buffer.toString('utf-8')
      // 尝试不同的分隔符
      const delimiters = ['\t', ',', ';', '|']
      let bestResult: any[] = []
      let maxColumns = 0
      
      for (const delimiter of delimiters) {
        try {
          const result = Papa.parse(txtText, {
            header: true,
            delimiter,
            skipEmptyLines: true,
            dynamicTyping: true
          })
          
          if (result.data.length > 0) {
            const columnCount = Object.keys(result.data[0]).length
            if (columnCount > maxColumns) {
              maxColumns = columnCount
              bestResult = result.data as any[]
            }
          }
        } catch (error) {
          continue
        }
      }
      
      return bestResult
    
    case 'json':
      const jsonText = buffer.toString('utf-8')
      const jsonData = JSON.parse(jsonText)
      return Array.isArray(jsonData) ? jsonData : [jsonData]
    
    default:
      throw new Error(`不支持的文件格式: ${extension}`)
  }
}

// 分析数据结构
router.post('/analyze-structure', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' })
    }

    // 解析文件数据
    const data = parseFileData(req.file.buffer, req.file.originalname)
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: '文件中没有有效数据' })
    }

    // 分析数据结构
    const analysis = DataStructureService.analyzeDataStructure(data)
    
    // 生成预处理建议
    const preprocessingSuggestions = DataStructureService.generatePreprocessingSuggestions(analysis)
    
    // 生成字段映射建议
    const fieldMappings = DataStructureService.suggestFieldMappings(analysis)

    res.json({
      success: true,
      data: {
        analysis,
        preprocessingSuggestions,
        fieldMappings,
        sampleData: data.slice(0, 5) // 返回前5行作为样本
      }
    })
  } catch (error) {
    console.error('数据结构分析失败:', error)
    res.status(500).json({ 
      error: '数据结构分析失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 验证字段映射
router.post('/validate-mapping', authenticateToken, async (req, res) => {
  try {
    const { data, fieldMapping } = req.body
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: '无效的数据' })
    }
    
    if (!fieldMapping) {
      return res.status(400).json({ error: '缺少字段映射信息' })
    }

    // 验证映射的字段是否存在
    const sampleRow = data[0]
    const availableFields = Object.keys(sampleRow)
    
    const validationResults = {
      effectSize: fieldMapping.effectSize && availableFields.includes(fieldMapping.effectSize),
      variance: fieldMapping.variance && availableFields.includes(fieldMapping.variance),
      sampleSize: fieldMapping.sampleSize && availableFields.includes(fieldMapping.sampleSize),
      studyName: fieldMapping.studyName && availableFields.includes(fieldMapping.studyName)
    }
    
    // 检查必需字段
    const missingRequired = []
    if (!validationResults.effectSize) {
      missingRequired.push('效应量字段')
    }
    
    // 检查数据类型
    const typeValidation = {
      effectSizeNumeric: true,
      varianceNumeric: true,
      sampleSizeNumeric: true
    }
    
    if (fieldMapping.effectSize) {
      const effectSizeValues = data.map(row => row[fieldMapping.effectSize]).filter(v => v !== null && v !== undefined)
      const numericCount = effectSizeValues.filter(v => !isNaN(parseFloat(v))).length
      typeValidation.effectSizeNumeric = numericCount / effectSizeValues.length > 0.8
    }
    
    if (fieldMapping.variance) {
      const varianceValues = data.map(row => row[fieldMapping.variance]).filter(v => v !== null && v !== undefined)
      const numericCount = varianceValues.filter(v => !isNaN(parseFloat(v))).length
      typeValidation.varianceNumeric = numericCount / varianceValues.length > 0.8
    }
    
    if (fieldMapping.sampleSize) {
      const sampleSizeValues = data.map(row => row[fieldMapping.sampleSize]).filter(v => v !== null && v !== undefined)
      const numericCount = sampleSizeValues.filter(v => !isNaN(parseFloat(v))).length
      typeValidation.sampleSizeNumeric = numericCount / sampleSizeValues.length > 0.8
    }
    
    const isValid = validationResults.effectSize && 
                   typeValidation.effectSizeNumeric &&
                   missingRequired.length === 0
    
    res.json({
      success: true,
      data: {
        isValid,
        validationResults,
        typeValidation,
        missingRequired,
        warnings: [
          ...(!typeValidation.effectSizeNumeric ? ['效应量字段包含非数值数据'] : []),
          ...(!typeValidation.varianceNumeric ? ['方差字段包含非数值数据'] : []),
          ...(!typeValidation.sampleSizeNumeric ? ['样本量字段包含非数值数据'] : []),
          ...(!validationResults.variance ? ['缺少方差字段，将影响权重计算'] : []),
          ...(!validationResults.sampleSize ? ['缺少样本量字段，将影响分析质量'] : [])
        ]
      }
    })
  } catch (error) {
    console.error('字段映射验证失败:', error)
    res.status(500).json({ 
      error: '字段映射验证失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
})

// 数据预处理
router.post('/preprocess', authenticateToken, async (req, res) => {
  try {
    const { data, fieldMapping, preprocessingOptions } = req.body
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: '无效的数据' })
    }
    
    if (!fieldMapping) {
      return res.status(400).json({ error: '缺少字段映射信息' })
    }

    let processedData = [...data]
    const processingLog: string[] = []
    
    // 1. 处理缺失值
    if (preprocessingOptions?.handleMissingValues) {
      const initialCount = processedData.length
      processedData = processedData.filter(row => {
        const effectSize = row[fieldMapping.effectSize]
        return effectSize !== null && effectSize !== undefined && effectSize !== ''
      })
      const removedCount = initialCount - processedData.length
      if (removedCount > 0) {
        processingLog.push(`移除了 ${removedCount} 行缺少效应量的数据`)
      }
    }
    
    // 2. 数据类型转换
    processedData = processedData.map(row => {
      const newRow = { ...row }
      
      // 转换效应量为数值
      if (fieldMapping.effectSize) {
        const value = parseFloat(newRow[fieldMapping.effectSize])
        if (!isNaN(value)) {
          newRow[fieldMapping.effectSize] = value
        }
      }
      
      // 转换方差为数值
      if (fieldMapping.variance) {
        const value = parseFloat(newRow[fieldMapping.variance])
        if (!isNaN(value)) {
          newRow[fieldMapping.variance] = value
        }
      }
      
      // 转换样本量为数值
      if (fieldMapping.sampleSize) {
        const value = parseFloat(newRow[fieldMapping.sampleSize])
        if (!isNaN(value)) {
          newRow[fieldMapping.sampleSize] = value
        }
      }
      
      return newRow
    })
    
    processingLog.push('完成数据类型转换')
    
    // 3. 异常值检测和处理
    if (preprocessingOptions?.handleOutliers && fieldMapping.effectSize) {
      const effectSizes = processedData.map(row => parseFloat(row[fieldMapping.effectSize])).filter(v => !isNaN(v))
      
      if (effectSizes.length > 0) {
        const mean = effectSizes.reduce((a, b) => a + b, 0) / effectSizes.length
        const std = Math.sqrt(effectSizes.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / effectSizes.length)
        
        const threshold = 3 // 3个标准差
        const initialCount = processedData.length
        
        processedData = processedData.filter(row => {
          const value = parseFloat(row[fieldMapping.effectSize])
          if (isNaN(value)) return true
          return Math.abs(value - mean) <= threshold * std
        })
        
        const removedCount = initialCount - processedData.length
        if (removedCount > 0) {
          processingLog.push(`移除了 ${removedCount} 个异常值（超过3个标准差）`)
        }
      }
    }
    
    // 4. 计算缺失的方差（如果只有标准误）
    if (fieldMapping.variance && preprocessingOptions?.calculateVariance) {
      processedData = processedData.map(row => {
        const newRow = { ...row }
        const variance = parseFloat(newRow[fieldMapping.variance])
        
        // 如果方差值很小，可能是标准误，需要平方
        if (!isNaN(variance) && variance > 0 && variance < 1) {
          // 假设这是标准误，转换为方差
          newRow[fieldMapping.variance] = variance * variance
        }
        
        return newRow
      })
      
      processingLog.push('检查并转换标准误为方差')
    }
    
    // 5. 生成处理后的统计信息
    const finalStats = {
      totalRows: processedData.length,
      effectSizeRange: fieldMapping.effectSize ? {
        min: Math.min(...processedData.map(row => parseFloat(row[fieldMapping.effectSize])).filter(v => !isNaN(v))),
        max: Math.max(...processedData.map(row => parseFloat(row[fieldMapping.effectSize])).filter(v => !isNaN(v)))
      } : null,
      completeness: {
        effectSize: fieldMapping.effectSize ? 
          processedData.filter(row => row[fieldMapping.effectSize] !== null && row[fieldMapping.effectSize] !== undefined).length / processedData.length * 100 : 0,
        variance: fieldMapping.variance ? 
          processedData.filter(row => row[fieldMapping.variance] !== null && row[fieldMapping.variance] !== undefined).length / processedData.length * 100 : 0,
        sampleSize: fieldMapping.sampleSize ? 
          processedData.filter(row => row[fieldMapping.sampleSize] !== null && row[fieldMapping.sampleSize] !== undefined).length / processedData.length * 100 : 0
      }
    }

    res.json({
      success: true,
      data: {
        processedData,
        processingLog,
        statistics: finalStats,
        readyForAnalysis: processedData.length >= 3 && finalStats.completeness.effectSize >= 80
      }
    })
  } catch (error) {
    console.error('数据预处理失败:', error)
    res.status(500).json({ 
      error: '数据预处理失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
})

export default router