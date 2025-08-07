interface DataColumn {
  name: string
  type: 'numeric' | 'categorical' | 'text' | 'date' | 'boolean'
  nullCount: number
  uniqueCount: number
  sampleValues: any[]
  statistics?: {
    min?: number
    max?: number
    mean?: number
    median?: number
    std?: number
  }
}

interface DataStructureAnalysis {
  totalRows: number
  totalColumns: number
  columns: DataColumn[]
  metaAnalysisCompatibility: {
    isCompatible: boolean
    requiredFields: {
      effectSize: string | null
      variance: string | null
      sampleSize: string | null
      studyName: string | null
    }
    suggestions: string[]
    confidence: number
  }
  dataQuality: {
    completeness: number
    consistency: number
    issues: string[]
  }
}

interface FieldMapping {
  original: string
  mapped: string
  confidence: number
  type: 'effect_size' | 'variance' | 'sample_size' | 'study_name' | 'group_variable' | 'other'
}

export class DataStructureService {
  // Meta分析常见字段的别名
  private static readonly FIELD_ALIASES = {
    effect_size: [
      'effect_size', 'effect', 'es', 'cohen_d', 'cohens_d', 'd', 'hedges_g', 'hedgesg',
      'mean_difference', 'md', 'smd', 'standardized_mean_difference',
      '效应量', '效应值', '标准化均值差', '均值差', 'Cohen\'s d', 'Hedges\' g'
    ],
    variance: [
      'variance', 'var', 'se', 'standard_error', 'stderr', 'se_squared',
      'sampling_variance', 'error_variance', 'vi',
      '方差', '标准误', '抽样方差', '误差方差'
    ],
    sample_size: [
      'sample_size', 'n', 'total_n', 'sample_n', 'participants', 'subjects',
      'n_total', 'n1', 'n2', 'group_size',
      '样本量', '样本数', '参与者数', '被试数', '总数'
    ],
    study_name: [
      'study', 'study_name', 'study_id', 'author', 'authors', 'paper',
      'reference', 'citation', 'title', 'study_title',
      '研究', '研究名称', '作者', '文献', '标题'
    ],
    group_variable: [
      'group', 'condition', 'treatment', 'intervention', 'category',
      'type', 'subgroup', 'population', 'setting',
      '组别', '条件', '干预', '类别', '亚组', '人群'
    ]
  }

  // 分析数据结构
  static analyzeDataStructure(data: any[]): DataStructureAnalysis {
    if (!data || data.length === 0) {
      throw new Error('No data provided for analysis')
    }

    const totalRows = data.length
    const sampleRow = data[0]
    const columnNames = Object.keys(sampleRow)
    const totalColumns = columnNames.length

    // 分析每一列
    const columns: DataColumn[] = columnNames.map(colName => 
      this.analyzeColumn(colName, data)
    )

    // 检查Meta分析兼容性
    const metaAnalysisCompatibility = this.checkMetaAnalysisCompatibility(columns)

    // 评估数据质量
    const dataQuality = this.assessDataQuality(data, columns)

    return {
      totalRows,
      totalColumns,
      columns,
      metaAnalysisCompatibility,
      dataQuality
    }
  }

  // 分析单列数据
  private static analyzeColumn(columnName: string, data: any[]): DataColumn {
    const values = data.map(row => row[columnName])
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '')
    
    const nullCount = data.length - nonNullValues.length
    const uniqueValues = [...new Set(nonNullValues)]
    const uniqueCount = uniqueValues.length
    
    // 获取样本值（最多5个）
    const sampleValues = uniqueValues.slice(0, 5)
    
    // 确定数据类型
    const type = this.determineColumnType(nonNullValues)
    
    // 计算统计信息（仅对数值型数据）
    let statistics: DataColumn['statistics'] = undefined
    if (type === 'numeric') {
      const numericValues = nonNullValues.map(v => parseFloat(v)).filter(v => !isNaN(v))
      if (numericValues.length > 0) {
        statistics = this.calculateStatistics(numericValues)
      }
    }

    return {
      name: columnName,
      type,
      nullCount,
      uniqueCount,
      sampleValues,
      statistics
    }
  }

  // 确定列的数据类型
  private static determineColumnType(values: any[]): DataColumn['type'] {
    if (values.length === 0) return 'text'

    // 检查是否为数值型
    const numericCount = values.filter(v => {
      const num = parseFloat(v)
      return !isNaN(num) && isFinite(num)
    }).length

    if (numericCount / values.length > 0.8) {
      return 'numeric'
    }

    // 检查是否为布尔型
    const booleanValues = ['true', 'false', '1', '0', 'yes', 'no', 'y', 'n']
    const booleanCount = values.filter(v => 
      booleanValues.includes(String(v).toLowerCase())
    ).length

    if (booleanCount / values.length > 0.8) {
      return 'boolean'
    }

    // 检查是否为日期型
    const dateCount = values.filter(v => {
      const date = new Date(v)
      return !isNaN(date.getTime())
    }).length

    if (dateCount / values.length > 0.8) {
      return 'date'
    }

    // 检查是否为分类型（唯一值较少）
    const uniqueRatio = new Set(values).size / values.length
    if (uniqueRatio < 0.1 && values.length > 10) {
      return 'categorical'
    }

    return 'text'
  }

  // 计算数值统计信息
  private static calculateStatistics(values: number[]) {
    const sorted = [...values].sort((a, b) => a - b)
    const sum = values.reduce((a, b) => a + b, 0)
    const mean = sum / values.length
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    const std = Math.sqrt(variance)
    
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean,
      median,
      std
    }
  }

  // 检查Meta分析兼容性
  private static checkMetaAnalysisCompatibility(columns: DataColumn[]) {
    const fieldMappings = this.mapFieldsToMetaAnalysis(columns)
    
    const requiredFields = {
      effectSize: fieldMappings.find(m => m.type === 'effect_size')?.original || null,
      variance: fieldMappings.find(m => m.type === 'variance')?.original || null,
      sampleSize: fieldMappings.find(m => m.type === 'sample_size')?.original || null,
      studyName: fieldMappings.find(m => m.type === 'study_name')?.original || null
    }

    const suggestions: string[] = []
    let confidence = 0

    // 检查必需字段
    if (requiredFields.effectSize) {
      confidence += 40
    } else {
      suggestions.push('缺少效应量字段，请确保数据中包含效应量信息（如Cohen\'s d、均值差等）')
    }

    if (requiredFields.variance) {
      confidence += 30
    } else {
      suggestions.push('缺少方差或标准误字段，建议添加用于权重计算的精度信息')
    }

    if (requiredFields.sampleSize) {
      confidence += 20
    } else {
      suggestions.push('缺少样本量字段，建议添加每个研究的样本数信息')
    }

    if (requiredFields.studyName) {
      confidence += 10
    } else {
      suggestions.push('建议添加研究标识字段，用于区分不同的研究')
    }

    // 检查数据质量
    const numericColumns = columns.filter(c => c.type === 'numeric')
    if (numericColumns.length < 2) {
      suggestions.push('数值型字段较少，请确保关键的统计数据为数值格式')
      confidence = Math.max(0, confidence - 20)
    }

    const isCompatible = requiredFields.effectSize !== null && confidence >= 40

    return {
      isCompatible,
      requiredFields,
      suggestions,
      confidence: Math.min(100, confidence)
    }
  }

  // 将字段映射到Meta分析字段
  private static mapFieldsToMetaAnalysis(columns: DataColumn[]): FieldMapping[] {
    const mappings: FieldMapping[] = []

    for (const column of columns) {
      const mapping = this.findBestFieldMatch(column)
      if (mapping) {
        mappings.push(mapping)
      }
    }

    return mappings
  }

  // 找到最佳字段匹配
  private static findBestFieldMatch(column: DataColumn): FieldMapping | null {
    const columnName = column.name.toLowerCase().trim()
    let bestMatch: FieldMapping | null = null
    let highestScore = 0

    for (const [fieldType, aliases] of Object.entries(this.FIELD_ALIASES)) {
      for (const alias of aliases) {
        const score = this.calculateMatchScore(columnName, alias.toLowerCase(), column)
        if (score > highestScore && score > 0.6) {
          highestScore = score
          bestMatch = {
            original: column.name,
            mapped: fieldType,
            confidence: score,
            type: fieldType as any
          }
        }
      }
    }

    return bestMatch
  }

  // 计算字段匹配分数
  private static calculateMatchScore(columnName: string, alias: string, column: DataColumn): number {
    let score = 0

    // 精确匹配
    if (columnName === alias) {
      score = 1.0
    }
    // 包含匹配
    else if (columnName.includes(alias) || alias.includes(columnName)) {
      score = 0.8
    }
    // 部分匹配
    else {
      const similarity = this.calculateStringSimilarity(columnName, alias)
      if (similarity > 0.6) {
        score = similarity * 0.7
      }
    }

    // 根据数据类型调整分数
    if (score > 0) {
      if (alias.includes('effect') || alias.includes('variance') || alias.includes('sample')) {
        if (column.type === 'numeric') {
          score *= 1.2
        } else {
          score *= 0.5
        }
      }
      
      if (alias.includes('study') || alias.includes('author')) {
        if (column.type === 'text' || column.type === 'categorical') {
          score *= 1.1
        } else {
          score *= 0.7
        }
      }
    }

    return Math.min(1.0, score)
  }

  // 计算字符串相似度
  private static calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const editDistance = this.levenshteinDistance(longer, shorter)
    return (longer.length - editDistance) / longer.length
  }

  // 计算编辑距离
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // 评估数据质量
  private static assessDataQuality(data: any[], columns: DataColumn[]) {
    const totalCells = data.length * columns.length
    const nullCells = columns.reduce((sum, col) => sum + col.nullCount, 0)
    const completeness = ((totalCells - nullCells) / totalCells) * 100

    const issues: string[] = []
    let consistency = 100

    // 检查完整性问题
    if (completeness < 90) {
      issues.push(`数据完整性较低（${completeness.toFixed(1)}%），存在较多缺失值`)
    }

    // 检查数值列的一致性
    const numericColumns = columns.filter(c => c.type === 'numeric')
    for (const col of numericColumns) {
      if (col.statistics) {
        const range = col.statistics.max - col.statistics.min
        const cv = col.statistics.std / Math.abs(col.statistics.mean)
        
        if (cv > 2) {
          issues.push(`字段