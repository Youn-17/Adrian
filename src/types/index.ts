// 项目数据类型定义
export interface Project {
  id: string;
  name: string;
  description: string;
  researchQuestion: string;
  inclusionCriteria: string;
  exclusionCriteria: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt: string;
  updatedAt: string;
}

// 数据集类型定义
export interface Dataset {
  id: string;
  projectId: string | null;
  name: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileType: 'csv' | 'excel' | 'word' | 'xlsx' | 'xls' | 'docx' | 'unknown';
  rowCount: number;
  columnCount: number;
  recordCount?: number;
  uploadedAt: string;
  createdAt: string;
  status: 'uploaded' | 'processed' | 'error';
  data?: any[];
  metadata?: Record<string, any>;
}

// 分析类型定义
export interface MetaAnalysisData {
  studies: Array<{
    id: string;
    studyName: string;
    effectSize: number;
    standardError: number;
    sampleSize: number;
    weight?: number;
  }>;
  confidenceInterval: [number, number];
  overallEffect?: {
    estimate: number;
    confidenceInterval: [number, number];
    pValue: number;
    significance: string;
  };
  heterogeneity?: {
    iSquared: number;
    qStatistic: number;
    pValue: number;
    interpretation: string;
  };
}

export interface AnalysisResults {
  studies?: MetaAnalysisData[];
  overallEffect?: {
    estimate: number;
    confidenceInterval: [number, number];
    pValue: number;
    significance: string;
  };
  heterogeneity?: {
    iSquared: number;
    qStatistic: number;
    pValue: number;
    interpretation: string;
  };
  publicationBias?: {
    eggerTest: {
      pValue: number;
      interpretation: string;
    };
    funnelPlot: string;
  };
  studyCount?: number;
  totalParticipants?: number;
  aiInterpretation?: string;
}

export interface Analysis {
  id: string;
  projectId: string | null;
  name: string;
  description?: string;
  type?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  parameters?: Record<string, any>;
  results?: AnalysisResults;
  createdAt: string;
  completedAt?: string;
  startedAt?: string;
  datasetIds: string[];
}

// 用户设置类型定义
export interface UserSettings {
  general: {
    language: 'zh' | 'en';
    notifications: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    compactMode: boolean;
  };
  apiSettings: {
    deepseekApiKey: string;
    requestTimeout: number;
    maxRetries: number;
    cacheResults: boolean;
  };
  privacy: {
    dataRetention: number;
    anonymizeData: boolean;
    shareUsageStats: boolean;
  };
}

// 数据管理类型定义
export interface DataManagement {
  storageUsed: number;
  storageLimit: number;
  projectCount: number;
  datasetCount: number;
  analysisCount: number;
  lastBackup?: string;
}

// 文件处理结果类型
export interface FileProcessResult {
  success: boolean;
  data?: any[];
  headers?: string[];
  rowCount?: number;
  columnCount?: number;
  error?: string;
  metadata?: {
    encoding?: string;
    delimiter?: string;
    fileSize?: number;
  };
}

// DeepSeek API响应类型
export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 统计分析结果类型
export interface StatisticalResult {
  effectSize: number;
  standardError: number;
  confidenceInterval: [number, number];
  pValue: number;
  zScore: number;
  weight: number;
}

// 图表数据类型
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}