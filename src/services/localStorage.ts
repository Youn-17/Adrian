import { StudyData } from './fileProcessor';
import { UserSettings, Analysis, Dataset, Project } from '../types';

// 数据模型定义





// 存储键名常量
const STORAGE_KEYS = {
  PROJECTS: 'meta_analysis_projects',
  DATASETS: 'meta_analysis_datasets',
  ANALYSES: 'meta_analysis_analyses',
  USER_SETTINGS: 'meta_analysis_settings',
  APP_VERSION: 'meta_analysis_version'
} as const;

class LocalStorageService {
  private readonly currentVersion = '1.0.0';

  constructor() {
    this.initializeStorage();
  }

  // 初始化存储
  private initializeStorage(): void {
    const version = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
    
    if (version !== this.currentVersion) {
      this.migrateData(version);
      localStorage.setItem(STORAGE_KEYS.APP_VERSION, this.currentVersion);
    }

    // 确保基础数据结构存在
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DATASETS)) {
      localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANALYSES)) {
      localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)) {
      this.saveUserSettings(this.getDefaultSettings());
    }
  }

  // 数据迁移
  private migrateData(oldVersion: string | null): void {
    console.log(`数据迁移: ${oldVersion || '未知版本'} -> ${this.currentVersion}`);
    // 这里可以添加版本迁移逻辑
  }

  // 项目管理
  getProjects(): Project[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getProject(id: string): Project | null {
    const projects = this.getProjects();
    return projects.find(p => p.id === id) || null;
  }

  saveProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      projects.push(project);
    }
    
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    
    // 同时删除相关的数据集和分析
    this.deleteDatasetsByProject(id);
    this.deleteAnalysesByProject(id);
  }

  // 数据集管理
  getDatasets(): Dataset[] {
    const data = localStorage.getItem(STORAGE_KEYS.DATASETS);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getDataset(id: string): Dataset | null {
    const datasets = this.getDatasets();
    return datasets.find(d => d.id === id) || null;
  }

  getDatasetsByProject(projectId: string): Dataset[] {
    return this.getDatasets().filter(d => d.projectId === projectId);
  }

  saveDataset(dataset: Dataset): void {
    const datasets = this.getDatasets();
    const index = datasets.findIndex(d => d.id === dataset.id);
    
    if (index >= 0) {
      datasets[index] = dataset;
    } else {
      datasets.push(dataset);
    }
    
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
  }

  deleteDataset(id: string): void {
    const datasets = this.getDatasets().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
  }

  deleteDatasetsByProject(projectId: string): void {
    const datasets = this.getDatasets().filter(d => d.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(datasets));
  }

  // 分析管理
  getAnalyses(): Analysis[] {
    const data = localStorage.getItem(STORAGE_KEYS.ANALYSES);
    if (!data) return [];
    
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getAnalysis(id: string): Analysis | null {
    const analyses = this.getAnalyses();
    return analyses.find(a => a.id === id) || null;
  }

  getAnalysesByProject(projectId: string): Analysis[] {
    return this.getAnalyses().filter(a => a.projectId === projectId);
  }

  saveAnalysis(analysis: Analysis): void {
    const analyses = this.getAnalyses();
    const index = analyses.findIndex(a => a.id === analysis.id);
    
    if (index >= 0) {
      analyses[index] = analysis;
    } else {
      analyses.push(analysis);
    }
    
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
  }

  deleteAnalysis(id: string): void {
    const analyses = this.getAnalyses().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
  }

  deleteAnalysesByProject(projectId: string): void {
    const analyses = this.getAnalyses().filter(a => a.projectId !== projectId);
    localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
  }

  // 用户设置
  getUserSettings(): UserSettings {
    const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (!data) return this.getDefaultSettings();
    
    try {
      return JSON.parse(data);
    } catch {
      return this.getDefaultSettings();
    }
  }

  saveUserSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
  }

  private getDefaultSettings(): UserSettings {
    return {
      general: {
        language: 'zh',
        notifications: true,
        autoSave: true,
        autoSaveInterval: 300
      },
      appearance: {
        theme: 'light',
        fontSize: 'medium',
        compactMode: false
      },
      apiSettings: {
        deepseekApiKey: '',
        requestTimeout: 30000,
        maxRetries: 3,
        cacheResults: true
      },
      privacy: {
        dataRetention: 365,
        anonymizeData: false,
        shareUsageStats: false
      }
    };
  }

  // 工具方法
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 数据导出
  exportAllData(): string {
    const data = {
      version: this.currentVersion,
      exportedAt: new Date().toISOString(),
      projects: this.getProjects(),
      datasets: this.getDatasets(),
      analyses: this.getAnalyses(),
      settings: this.getUserSettings()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // 数据导入
  importData(jsonData: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.projects) {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
      }
      if (data.datasets) {
        localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(data.datasets));
      }
      if (data.analyses) {
        localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(data.analyses));
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(data.settings));
      }
      
      return { success: true, message: '数据导入成功' };
    } catch (error) {
      return { 
        success: false, 
        message: `数据导入失败: ${error instanceof Error ? error.message : '未知错误'}` 
      };
    }
  }

  // 清空所有数据
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.initializeStorage();
  }

  // 获取存储使用情况
  getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        used += localStorage.getItem(key)?.length || 0;
      }
    }
    
    // 大多数浏览器的localStorage限制是5MB
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / available) * 100;
    
    return { used, available, percentage };
  }
}

export const localStorageService = new LocalStorageService();