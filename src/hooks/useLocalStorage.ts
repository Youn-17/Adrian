import { useState, useEffect, useCallback } from 'react';
import { localStorageService } from '../services/localStorage';
import { UserSettings, Project, Dataset, Analysis } from '../types';

// 项目管理Hook
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProjects = () => {
      try {
        const data = localStorageService.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('加载项目失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  const createProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: localStorageService.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    localStorageService.saveProject(newProject);
    setProjects(prev => [...prev, newProject]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    const existingProject = localStorageService.getProject(id);
    if (!existingProject) return null;

    const updatedProject = {
      ...existingProject,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    localStorageService.saveProject(updatedProject);
    setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    return updatedProject;
  }, []);

  const deleteProject = useCallback((id: string) => {
    localStorageService.deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id) || null;
  }, [projects]);

  return {
    projects,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    getProject
  };
};

// 数据集管理Hook
export const useDatasets = (projectId?: string) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDatasets = () => {
      try {
        const data = projectId 
          ? localStorageService.getDatasetsByProject(projectId)
          : localStorageService.getDatasets();
        setDatasets(data);
      } catch (error) {
        console.error('加载数据集失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDatasets();
  }, [projectId]);

  const createDataset = useCallback((datasetData: Omit<Dataset, 'id' | 'uploadedAt'>) => {
    const newDataset: Dataset = {
      ...datasetData,
      id: localStorageService.generateId(),
      uploadedAt: new Date().toISOString()
    };
    
    localStorageService.saveDataset(newDataset);
    setDatasets(prev => [...prev, newDataset]);
    return newDataset;
  }, []);

  const updateDataset = useCallback((id: string, updates: Partial<Dataset>) => {
    const existingDataset = localStorageService.getDataset(id);
    if (!existingDataset) return null;

    const updatedDataset = {
      ...existingDataset,
      ...updates
    };
    
    localStorageService.saveDataset(updatedDataset);
    setDatasets(prev => prev.map(d => d.id === id ? updatedDataset : d));
    return updatedDataset;
  }, []);

  const deleteDataset = useCallback((id: string) => {
    localStorageService.deleteDataset(id);
    setDatasets(prev => prev.filter(d => d.id !== id));
  }, []);

  const getDataset = useCallback((id: string) => {
    return datasets.find(d => d.id === id) || null;
  }, [datasets]);

  return {
    datasets,
    isLoading,
    createDataset,
    updateDataset,
    deleteDataset,
    getDataset
  };
};

// 分析管理Hook
export const useAnalyses = (projectId?: string) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalyses = () => {
      try {
        const data = projectId 
          ? localStorageService.getAnalysesByProject(projectId)
          : localStorageService.getAnalyses();
        setAnalyses(data);
      } catch (error) {
        console.error('加载分析失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalyses();
  }, [projectId]);

  const createAnalysis = useCallback((analysisData: Omit<Analysis, 'id' | 'startedAt'>) => {
    const newAnalysis: Analysis = {
      ...analysisData,
      id: localStorageService.generateId(),
      startedAt: new Date().toISOString()
    };
    
    localStorageService.saveAnalysis(newAnalysis);
    setAnalyses(prev => [...prev, newAnalysis]);
    return newAnalysis;
  }, []);

  const updateAnalysis = useCallback((id: string, updates: Partial<Analysis>) => {
    const existingAnalysis = localStorageService.getAnalysis(id);
    if (!existingAnalysis) return null;

    const updatedAnalysis = {
      ...existingAnalysis,
      ...updates,
      ...(updates.status === 'completed' && !existingAnalysis.completedAt ? 
        { completedAt: new Date().toISOString() } : {})
    };
    
    localStorageService.saveAnalysis(updatedAnalysis);
    setAnalyses(prev => prev.map(a => a.id === id ? updatedAnalysis : a));
    return updatedAnalysis;
  }, []);

  const deleteAnalysis = useCallback((id: string) => {
    localStorageService.deleteAnalysis(id);
    setAnalyses(prev => prev.filter(a => a.id !== id));
  }, []);

  const getAnalysis = useCallback((id: string) => {
    return analyses.find(a => a.id === id) || null;
  }, [analyses]);

  return {
    analyses,
    isLoading,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis,
    getAnalysis
  };
};

// 用户设置Hook
export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      try {
        const data = localStorageService.getUserSettings();
        setSettings(data);
      } catch (error) {
        console.error('加载用户设置失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      ...updates
    };
    
    localStorageService.saveUserSettings(updatedSettings);
    setSettings(updatedSettings);
  }, [settings]);

  const resetSettings = useCallback(() => {
    const defaultSettings: UserSettings = {
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
    
    localStorageService.saveUserSettings(defaultSettings);
    setSettings(defaultSettings);
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings
  };
};

// 数据导入导出Hook
export const useDataManagement = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async () => {
    setIsExporting(true);
    setError(null);
    
    try {
      const data = localStorageService.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `meta_analysis_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importData = useCallback(async (file: File) => {
    setIsImporting(true);
    setError(null);
    
    try {
      const text = await file.text();
      const result = localStorageService.importData(text);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // 刷新页面以重新加载数据
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setIsImporting(false);
    }
  }, []);

  const clearAllData = useCallback(() => {
    if (window.confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      localStorageService.clearAllData();
      window.location.reload();
    }
  }, []);

  const getStorageInfo = useCallback(() => {
    return localStorageService.getStorageInfo();
  }, []);

  return {
    isExporting,
    isImporting,
    error,
    exportData,
    importData,
    clearAllData,
    getStorageInfo,
    clearError: () => setError(null)
  };
};

// 通用的本地存储Hook
export const useLocalStorageState = <T>(key: string, defaultValue: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`保存到localStorage失败 (key: ${key}):`, error);
    }
  }, [key, value]);

  const removeStoredValue = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.error(`从localStorage删除失败 (key: ${key}):`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeStoredValue] as const;
};