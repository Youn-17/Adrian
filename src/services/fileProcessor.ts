import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// 文件类型定义
export interface FileData {
  id: string;
  name: string;
  type: 'csv' | 'excel' | 'word' | 'txt';
  size: number;
  uploadedAt: Date;
  data?: any[];
  content?: string;
  error?: string;
}

// CSV/Excel数据行接口
export interface StudyData {
  id?: string;
  title: string;
  author: string;
  year: number;
  journal?: string;
  sampleSize: number;
  effectSize: number;
  standardError: number;
  confidenceInterval?: [number, number];
  pValue?: number;
  studyType?: string;
  intervention?: string;
  outcome?: string;
  notes?: string;
}

// 文件验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

class FileProcessor {
  // 支持的文件类型
  private readonly supportedTypes = {
    csv: ['.csv'],
    excel: ['.xlsx', '.xls'],
    word: ['.docx'],
    txt: ['.txt']
  };

  // 必需的CSV/Excel列名（中英文对照）
  private readonly requiredColumns = {
    title: ['title', '标题', '研究标题', 'study_title'],
    author: ['author', '作者', 'authors', 'first_author'],
    year: ['year', '年份', '发表年份', 'publication_year'],
    sampleSize: ['sample_size', '样本量', 'n', 'sample_n', 'participants'],
    effectSize: ['effect_size', '效应量', 'effect', 'es', 'cohen_d', 'odds_ratio'],
    standardError: ['standard_error', '标准误', 'se', 'std_error']
  };

  // 检查文件类型
  getFileType(file: File): 'csv' | 'excel' | 'word' | 'txt' | 'unsupported' {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (this.supportedTypes.csv.includes(extension)) return 'csv';
    if (this.supportedTypes.excel.includes(extension)) return 'excel';
    if (this.supportedTypes.word.includes(extension)) return 'word';
    if (this.supportedTypes.txt.includes(extension)) return 'txt';
    
    return 'unsupported';
  }

  // 处理文件上传
  async processFile(file: File): Promise<FileData> {
    const fileType = this.getFileType(file);
    
    if (fileType === 'unsupported') {
      throw new Error(`不支持的文件类型: ${file.name}`);
    }

    const fileData: FileData = {
      id: this.generateId(),
      name: file.name,
      type: fileType,
      size: file.size,
      uploadedAt: new Date()
    };

    try {
      switch (fileType) {
        case 'csv':
          fileData.data = await this.parseCSV(file);
          break;
        case 'excel':
          fileData.data = await this.parseExcel(file);
          break;
        case 'word':
          fileData.content = await this.parseWord(file);
          break;
        case 'txt':
          fileData.content = await this.parseTXT(file);
          break;
      }
    } catch (error) {
      fileData.error = error instanceof Error ? error.message : '文件解析失败';
    }

    return fileData;
  }

  // 解析CSV文件
  private async parseCSV(file: File): Promise<StudyData[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          try {
            const data = this.normalizeData(results.data as any[]);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV解析错误: ${error.message}`));
        }
      });
    });
  }

  // 解析Excel文件
  private async parseExcel(file: File): Promise<StudyData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 读取第一个工作表
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // 转换为JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // 处理数据
          const processedData = this.processExcelData(jsonData as any[][]);
          const normalizedData = this.normalizeData(processedData);
          
          resolve(normalizedData);
        } catch (error) {
          reject(new Error(`Excel解析错误: ${error instanceof Error ? error.message : '未知错误'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  // 解析Word文档
  private async parseWord(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(new Error(`Word文档解析错误: ${error instanceof Error ? error.message : '未知错误'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  // 解析TXT文件
  private async parseTXT(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          resolve(content);
        } catch (error) {
          reject(new Error(`TXT文件解析错误: ${error instanceof Error ? error.message : '未知错误'}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  // 处理Excel原始数据
  private processExcelData(rawData: any[][]): any[] {
    if (rawData.length === 0) return [];
    
    // 第一行作为表头
    const headers = rawData[0].map(h => String(h).trim());
    const dataRows = rawData.slice(1);
    
    return dataRows.map(row => {
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  }

  // 标准化数据格式
  private normalizeData(rawData: any[]): StudyData[] {
    return rawData.map((row, index) => {
      const normalizedRow: StudyData = {
        id: this.generateId(),
        title: this.findColumnValue(row, this.requiredColumns.title) || `研究 ${index + 1}`,
        author: this.findColumnValue(row, this.requiredColumns.author) || '未知作者',
        year: this.parseNumber(this.findColumnValue(row, this.requiredColumns.year)) || new Date().getFullYear(),
        sampleSize: this.parseNumber(this.findColumnValue(row, this.requiredColumns.sampleSize)) || 0,
        effectSize: this.parseNumber(this.findColumnValue(row, this.requiredColumns.effectSize)) || 0,
        standardError: this.parseNumber(this.findColumnValue(row, this.requiredColumns.standardError)) || 0
      };

      // 可选字段
      const journal = this.findColumnValue(row, ['journal', '期刊', 'publication']);
      if (journal) normalizedRow.journal = journal;

      const pValue = this.parseNumber(this.findColumnValue(row, ['p_value', 'p值', 'pvalue', 'p']));
      if (pValue !== null) normalizedRow.pValue = pValue;

      const studyType = this.findColumnValue(row, ['study_type', '研究类型', 'type']);
      if (studyType) normalizedRow.studyType = studyType;

      const intervention = this.findColumnValue(row, ['intervention', '干预', 'treatment']);
      if (intervention) normalizedRow.intervention = intervention;

      const outcome = this.findColumnValue(row, ['outcome', '结局', 'endpoint']);
      if (outcome) normalizedRow.outcome = outcome;

      const notes = this.findColumnValue(row, ['notes', '备注', 'comments']);
      if (notes) normalizedRow.notes = notes;

      return normalizedRow;
    }).filter(row => row.sampleSize > 0 && row.effectSize !== 0); // 过滤无效数据
  }

  // 查找列值（支持多种列名）
  private findColumnValue(row: any, possibleNames: string[]): string | null {
    for (const name of possibleNames) {
      const value = row[name] || row[name.toLowerCase()] || row[name.toUpperCase()];
      if (value !== undefined && value !== null && value !== '') {
        return String(value).trim();
      }
    }
    return null;
  }

  // 解析数字
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  // 验证数据质量
  validateData(data: StudyData[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    if (data.length === 0) {
      errors.push('没有找到有效的研究数据');
      return { isValid: false, errors, warnings, suggestions };
    }

    if (data.length < 3) {
      warnings.push('研究数量较少（少于3项），可能影响元分析结果的可靠性');
    }

    // 检查必需字段
    data.forEach((study, index) => {
      if (!study.title || study.title.trim() === '') {
        warnings.push(`第${index + 1}项研究缺少标题`);
      }
      
      if (!study.author || study.author.trim() === '') {
        warnings.push(`第${index + 1}项研究缺少作者信息`);
      }
      
      if (study.sampleSize <= 0) {
        errors.push(`第${index + 1}项研究的样本量无效: ${study.sampleSize}`);
      }
      
      if (study.standardError <= 0) {
        errors.push(`第${index + 1}项研究的标准误无效: ${study.standardError}`);
      }
      
      if (Math.abs(study.effectSize) > 5) {
        warnings.push(`第${index + 1}项研究的效应量异常大: ${study.effectSize}`);
      }
    });

    // 提供改进建议
    if (data.some(s => !s.journal)) {
      suggestions.push('建议补充期刊信息以提高数据完整性');
    }
    
    if (data.some(s => !s.pValue)) {
      suggestions.push('建议补充p值信息以便进行更全面的分析');
    }
    
    if (data.some(s => !s.studyType)) {
      suggestions.push('建议补充研究类型信息以便进行亚组分析');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 导出数据为CSV
  exportToCSV(data: StudyData[], filename: string = 'meta_analysis_data.csv'): void {
    const csv = Papa.unparse(data, {
      header: true
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // 导出数据为Excel
  exportToExcel(data: StudyData[], filename: string = 'meta_analysis_data.xlsx'): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '元分析数据');
    XLSX.writeFile(workbook, filename);
  }
}

export const fileProcessor = new FileProcessor();