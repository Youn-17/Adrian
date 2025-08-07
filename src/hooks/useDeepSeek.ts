import { useState, useCallback } from 'react';
import { metaAnalysisAI, MetaAnalysisData, AnalysisResult } from '../services/metaAnalysisAI';
import { aiService } from '../services/aiService';

interface UseAIReturn {
  // 状态
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  availablePlatforms: string[];
  
  // 方法
  checkConnection: () => Promise<boolean>;
  assessDataQuality: (data: MetaAnalysisData) => Promise<string>;
  recommendMethods: (data: MetaAnalysisData) => Promise<string>;
  interpretResults: (data: MetaAnalysisData) => Promise<AnalysisResult>;
  interpretPublicationBias: (biasResults: any) => Promise<string>;
  interpretSubgroupAnalysis: (subgroupResults: any) => Promise<string>;
  interpretSensitivityAnalysis: (sensitivityResults: any[]) => Promise<string>;
  interpretComprehensiveResults: (analysisResults: any) => Promise<AnalysisResult>;
  generateReport: (data: MetaAnalysisData, title: string) => Promise<string>;
  clearError: () => void;
  hasValidApiKey: () => boolean;
}

export const useAI = (): UseAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [availablePlatforms, setAvailablePlatforms] = useState<string[]>([]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!aiService.hasValidApiKey()) {
        setError('没有可用的AI平台API密钥，请先在设置中配置API密钥');
        setIsConnected(false);
        setAvailablePlatforms([]);
        return false;
      }

      const platforms = aiService.getAvailablePlatforms();
      setAvailablePlatforms(platforms);
      
      const connectionResults = await aiService.checkConnection();
      const hasConnection = connectionResults.some(result => result.connected);
      setIsConnected(hasConnection);
      
      if (!hasConnection) {
        setError('无法连接到任何AI平台，请检查网络连接和API密钥配置');
      }
      
      return hasConnection;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '连接检查失败';
      setError(errorMessage);
      setIsConnected(false);
      setAvailablePlatforms([]);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const assessDataQuality = useCallback(async (data: MetaAnalysisData): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const assessment = await metaAnalysisAI.assessDataQuality(data);
      return assessment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '数据质量评估失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recommendMethods = useCallback(async (data: MetaAnalysisData): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const recommendations = await metaAnalysisAI.recommendStatisticalMethods(data);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '统计方法推荐失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const interpretResults = useCallback(async (data: MetaAnalysisData): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const interpretation = await metaAnalysisAI.interpretResults(data);
      return interpretation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '结果解读失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateReport = useCallback(async (data: MetaAnalysisData, title: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const report = await metaAnalysisAI.generateAcademicReport(data, title);
      return report;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '学术报告生成失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const interpretPublicationBias = useCallback(async (biasResults: any): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const interpretation = await metaAnalysisAI.interpretPublicationBias(biasResults);
      return interpretation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发表偏倚解读失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const interpretSubgroupAnalysis = useCallback(async (subgroupResults: any): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const interpretation = await metaAnalysisAI.interpretSubgroupAnalysis(subgroupResults);
      return interpretation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '亚组分析解读失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const interpretSensitivityAnalysis = useCallback(async (sensitivityResults: any[]): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const interpretation = await metaAnalysisAI.interpretSensitivityAnalysis(sensitivityResults);
      return interpretation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '敏感性分析解读失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const interpretComprehensiveResults = useCallback(async (analysisResults: any): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const interpretation = await metaAnalysisAI.interpretComprehensiveResults(analysisResults);
      return interpretation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '综合结果解读失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const hasValidApiKey = useCallback(() => {
    return aiService.hasValidApiKey();
  }, []);

  return {
    isLoading,
    error,
    isConnected,
    availablePlatforms,
    checkConnection,
    assessDataQuality,
    recommendMethods,
    interpretResults,
    interpretPublicationBias,
    interpretSubgroupAnalysis,
    interpretSensitivityAnalysis,
    interpretComprehensiveResults,
    generateReport,
    clearError,
    hasValidApiKey
  };
};

// 简化版本的hook，用于快速AI咨询
export const useAIConsultant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = useCallback(async (question: string, context?: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const messages = [
        {
          role: 'system' as const,
          content: '你是一位专业的元分析专家，请用中文回答用户关于元分析的问题。'
        },
        {
          role: 'user' as const,
          content: context ? `背景信息：${context}\n\n问题：${question}` : question
        }
      ];
      
      const response = await aiService.chatCompletion(messages);
      return response.choices[0]?.message?.content || '抱歉，无法获取回答';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI咨询失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    askQuestion,
    clearError: () => setError(null)
  };
};