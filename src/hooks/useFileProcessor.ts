import { useState, useCallback } from 'react';
import { fileProcessor, FileData, StudyData, ValidationResult } from '../services/fileProcessor';

interface UseFileProcessorReturn {
  // 状态
  isProcessing: boolean;
  uploadedFiles: FileData[];
  processedData: StudyData[];
  validationResult: ValidationResult | null;
  error: string | null;
  
  // 方法
  processFiles: (files: File[] | FileList) => Promise<any[]>;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  validateData: (data: StudyData[]) => ValidationResult;
  exportToCSV: (data: StudyData[], filename?: string) => void;
  exportToExcel: (data: StudyData[], filename?: string) => void;
  clearError: () => void;
}

export const useFileProcessor = (): UseFileProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
  const [processedData, setProcessedData] = useState<StudyData[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const processFiles = useCallback(async (files: File[] | FileList): Promise<any[]> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const fileArray = Array.isArray(files) ? files : Array.from(files);
      const processedFiles: FileData[] = [];
      const allData: StudyData[] = [];
      const results: any[] = [];
      
      for (const file of fileArray) {
        try {
          const fileData = await fileProcessor.processFile(file);
          processedFiles.push(fileData);
          results.push(fileData);
          
          // 如果是数据文件，合并数据
          if (fileData.data && Array.isArray(fileData.data)) {
            allData.push(...fileData.data);
          }
        } catch (fileError) {
          console.error(`处理文件 ${file.name} 时出错:`, fileError);
          const errorData = {
            id: Date.now().toString() + Math.random().toString(36).substr(2),
            name: file.name,
            type: fileProcessor.getFileType(file) as any,
            size: file.size,
            uploadedAt: new Date(),
            error: fileError instanceof Error ? fileError.message : '文件处理失败'
          };
          processedFiles.push(errorData);
          results.push(errorData);
        }
      }
      
      setUploadedFiles(prev => [...prev, ...processedFiles]);
      
      if (allData.length > 0) {
        setProcessedData(prev => [...prev, ...allData]);
        
        // 验证合并后的数据
        const validation = fileProcessor.validateData([...processedData, ...allData]);
        setValidationResult(validation);
      }
      
      return results;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '文件处理失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [processedData]);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => {
      const updatedFiles = prev.filter(file => file.id !== fileId);
      
      // 重新计算处理后的数据
      const newData: StudyData[] = [];
      updatedFiles.forEach(file => {
        if (file.data && Array.isArray(file.data)) {
          newData.push(...file.data);
        }
      });
      
      setProcessedData(newData);
      
      // 重新验证数据
      if (newData.length > 0) {
        const validation = fileProcessor.validateData(newData);
        setValidationResult(validation);
      } else {
        setValidationResult(null);
      }
      
      return updatedFiles;
    });
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setProcessedData([]);
    setValidationResult(null);
    setError(null);
  }, []);

  const validateData = useCallback((data: StudyData[]): ValidationResult => {
    const result = fileProcessor.validateData(data);
    setValidationResult(result);
    return result;
  }, []);

  const exportToCSV = useCallback((data: StudyData[], filename?: string) => {
    try {
      fileProcessor.exportToCSV(data, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出CSV失败');
    }
  }, []);

  const exportToExcel = useCallback((data: StudyData[], filename?: string) => {
    try {
      fileProcessor.exportToExcel(data, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出Excel失败');
    }
  }, []);

  return {
    isProcessing,
    uploadedFiles,
    processedData,
    validationResult,
    error,
    processFiles,
    removeFile,
    clearFiles,
    validateData,
    exportToCSV,
    exportToExcel,
    clearError
  };
};

// 简化版本的hook，用于单文件处理
export const useSingleFileProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(async (file: File): Promise<FileData> => {
    setIsProcessing(true);
    setError(null);
    
    try {
      const data = await fileProcessor.processFile(file);
      setFileData(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '文件处理失败';
      setError(errorMessage);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFileData(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    fileData,
    error,
    processFile,
    clearFile,
    clearError: () => setError(null)
  };
};