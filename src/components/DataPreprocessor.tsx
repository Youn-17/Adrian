import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  X, 
  RefreshCw,
  Download,
  Upload,
  Database,
  TrendingUp,
  BarChart3,
  Info,
  Settings,
  Filter,
  FileText,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { dataAnalysisApi } from '../utils/api';

interface DataStructureAnalysis {
  totalRows: number;
  totalColumns: number;
  columns: {
    name: string;
    type: 'numeric' | 'categorical' | 'text' | 'date' | 'boolean';
    nullCount: number;
    uniqueCount: number;
    sampleValues: any[];
    statistics?: {
      min?: number;
      max?: number;
      mean?: number;
      median?: number;
      std?: number;
    };
  }[];
  metaAnalysisCompatibility: {
    isCompatible: boolean;
    requiredFields: {
      effectSize: string | null;
      variance: string | null;
      sampleSize: string | null;
      studyName: string | null;
    };
    suggestions: string[];
    confidence: number;
  };
  dataQuality: {
    completeness: number;
    consistency: number;
    issues: string[];
  };
}

interface FieldMapping {
  effectSize?: string;
  variance?: string;
  sampleSize?: string;
  studyName?: string;
  groupVariable?: string;
}

interface PreprocessingOptions {
  handleMissingValues: boolean;
  handleOutliers: boolean;
  calculateVariance: boolean;
}

interface DataPreprocessorProps {
  data: any[];
  fileName: string;
  onDataProcessed: (processedData: any[], metadata: any) => void;
  onClose: () => void;
}

const DataPreprocessor: React.FC<DataPreprocessorProps> = ({ 
  data, 
  fileName, 
  onDataProcessed, 
  onClose 
}) => {
  const [currentStep, setCurrentStep] = useState<'analyze' | 'mapping' | 'preprocess' | 'complete'>('analyze');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DataStructureAnalysis | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [preprocessingOptions, setPreprocessingOptions] = useState<PreprocessingOptions>({
    handleMissingValues: true,
    handleOutliers: false,
    calculateVariance: true
  });
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [processingLog, setProcessingLog] = useState<string[]>([]);
  const [validationResult, setValidationResult] = useState<any>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      analyzeDataStructure();
    }
  }, [data]);

  const analyzeDataStructure = async () => {
    setIsLoading(true);
    try {
      // 创建FormData并上传文件进行分析
      const formData = new FormData();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      formData.append('file', blob, fileName || 'data.json');

      const response = await dataAnalysisApi.analyzeStructure(formData);
      
      if (response.success) {
        setAnalysis(response.data.analysis);
        
        // 自动设置字段映射建议
        const suggestedMapping: FieldMapping = {
          effectSize: response.data.fieldMappings.effectSize[0] || null,
          variance: response.data.fieldMappings.variance[0] || null,
          sampleSize: response.data.fieldMappings.sampleSize[0] || null,
          studyName: response.data.fieldMappings.studyName[0] || null,
          groupVariable: response.data.fieldMappings.groupVariables[0] || null
        };
        setFieldMapping(suggestedMapping);
        
        setCurrentStep('mapping');
        
        if (response.data.preprocessingSuggestions.length > 0) {
          toast.info(`发现 ${response.data.preprocessingSuggestions.length} 个数据处理建议`);
        }
      }
    } catch (error) {
      console.error('数据结构分析失败:', error);
      toast.error('数据结构分析失败: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const validateMapping = async () => {
    setIsLoading(true);
    try {
      const response = await dataAnalysisApi.validateMapping({
        data,
        fieldMapping
      });
      
      if (response.success) {
        setValidationResult(response.data);
        
        if (response.data.isValid) {
          toast.success('字段映射验证通过');
          setCurrentStep('preprocess');
        } else {
          toast.warning('字段映射存在问题，请检查并修正');
        }
      }
    } catch (error) {
      console.error('字段映射验证失败:', error);
      toast.error('字段映射验证失败: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const preprocessData = async () => {
    setIsLoading(true);
    try {
      const response = await dataAnalysisApi.preprocess({
        data,
        fieldMapping,
        preprocessingOptions
      });
      
      if (response.success) {
        setProcessedData(response.data.processedData);
        setProcessingLog(response.data.processingLog);
        
        toast.success(`数据预处理完成，处理了 ${response.data.processedData.length} 行数据`);
        setCurrentStep('complete');
      }
    } catch (error) {
      console.error('数据预处理失败:', error);
      toast.error('数据预处理失败: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const completePreprocessing = () => {
    const metadata = {
      originalRowCount: data.length,
      processedRowCount: processedData.length,
      fieldMapping,
      analysis,
      processingLog,
      validationResult
    };
    
    onDataProcessed(processedData, metadata);
    onClose();
  };

  const getStepStatus = (step: string) => {
    const steps = ['analyze', 'mapping', 'preprocess', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const renderAnalysisStep = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-900">正在分析数据结构...</p>
            <p className="text-sm text-gray-500 mt-2">这可能需要几秒钟时间</p>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">数据结构分析完成</h3>
            
            {/* 数据概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analysis.totalRows}</div>
                <div className="text-sm text-blue-800">总行数</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analysis.totalColumns}</div>
                <div className="text-sm text-green-800">总列数</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{analysis.dataQuality.completeness.toFixed(1)}%</div>
                <div className="text-sm text-yellow-800">数据完整性</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analysis.metaAnalysisCompatibility.confidence}%</div>
                <div className="text-sm text-purple-800">Meta分析兼容性</div>
              </div>
            </div>
            
            {/* 兼容性状态 */}
            <div className={`p-4 rounded-lg border ${
              analysis.metaAnalysisCompatibility.isCompatible 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                {analysis.metaAnalysisCompatibility.isCompatible ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                )}
                <span className={`font-medium ${
                  analysis.metaAnalysisCompatibility.isCompatible 
                    ? 'text-green-800' 
                    : 'text-yellow-800'
                }`}>
                  {analysis.metaAnalysisCompatibility.isCompatible 
                    ? '数据与Meta分析兼容' 
                    : '数据需要进一步处理以兼容Meta分析'
                  }
                </span>
              </div>
              
              {analysis.metaAnalysisCompatibility.suggestions.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">建议:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {analysis.metaAnalysisCompatibility.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setCurrentStep('mapping')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              继续进行字段映射
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Database className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">准备分析数据结构</p>
            <button
              onClick={analyzeDataStructure}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              开始分析
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">字段映射配置</h3>
        <p className="text-sm text-gray-500 mt-2">请将您的数据字段映射到Meta分析所需的标准字段</p>
      </div>
      
      {analysis && (
        <div className="space-y-4">
          {/* 必需字段映射 */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-3">必需字段</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  效应量字段 *
                </label>
                <select
                  value={fieldMapping.effectSize || ''}
                  onChange={(e) => setFieldMapping(prev => ({ ...prev, effectSize: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择字段</option>
                  {analysis.columns.filter(col => col.type === 'numeric').map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  研究标识字段
                </label>
                <select
                  value={fieldMapping.studyName || ''}
                  onChange={(e) => setFieldMapping(prev => ({ ...prev, studyName: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择字段</option>
                  {analysis.columns.filter(col => col.type === 'text' || col.type === 'categorical').map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* 可选字段映射 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-3">可选字段</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  方差/标准误字段
                </label>
                <select
                  value={fieldMapping.variance || ''}
                  onChange={(e) => setFieldMapping(prev => ({ ...prev, variance: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择字段</option>
                  {analysis.columns.filter(col => col.type === 'numeric').map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  样本量字段
                </label>
                <select
                  value={fieldMapping.sampleSize || ''}
                  onChange={(e) => setFieldMapping(prev => ({ ...prev, sampleSize: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择字段</option>
                  {analysis.columns.filter(col => col.type === 'numeric').map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  分组变量字段
                </label>
                <select
                  value={fieldMapping.groupVariable || ''}
                  onChange={(e) => setFieldMapping(prev => ({ ...prev, groupVariable: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择字段</option>
                  {analysis.columns.filter(col => col.type === 'categorical' || col.type === 'text').map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* 验证结果 */}
          {validationResult && (
            <div className={`p-4 rounded-lg border ${
              validationResult.isValid 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center mb-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                )}
                <span className={`font-medium ${
                  validationResult.isValid ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {validationResult.isValid ? '字段映射有效' : '字段映射需要调整'}
                </span>
              </div>
              
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">警告:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {validationResult.warnings.map((warning: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentStep('analyze')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              返回分析
            </button>
            <button
              onClick={validateMapping}
              disabled={isLoading || !fieldMapping.effectSize}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isLoading ? '验证中...' : '验证映射'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderPreprocessStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">数据预处理配置</h3>
        <p className="text-sm text-gray-500 mt-2">选择需要应用的数据预处理选项</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">预处理选项</h4>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preprocessingOptions.handleMissingValues}
                onChange={(e) => setPreprocessingOptions(prev => ({ 
                  ...prev, 
                  handleMissingValues: e.target.checked 
                }))}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="font-medium text-gray-700">处理缺失值</span>
                <p className="text-sm text-gray-500">移除缺少关键字段（如效应量）的行</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preprocessingOptions.handleOutliers}
                onChange={(e) => setPreprocessingOptions(prev => ({ 
                  ...prev, 
                  handleOutliers: e.target.checked 
                }))}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="font-medium text-gray-700">处理异常值</span>
                <p className="text-sm text-gray-500">移除超过3个标准差的异常值</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preprocessingOptions.calculateVariance}
                onChange={(e) => setPreprocessingOptions(prev => ({ 
                  ...prev, 
                  calculateVariance: e.target.checked 
                }))}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div>
                <span className="font-medium text-gray-700">转换标准误为方差</span>
                <p className="text-sm text-gray-500">如果方差字段实际为标准误，自动转换为方差</p>
              </div>
            </label>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('mapping')}
            className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            返回映射
          </button>
          <button
            onClick={preprocessData}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? '处理中...' : '开始预处理'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">数据预处理完成</h3>
        <p className="text-sm text-gray-500 mt-2">您的数据已准备好进行Meta分析</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-blue-800">原始行数</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{processedData.length}</div>
          <div className="text-sm text-green-800">处理后行数</div>
        </div>
      </div>
      
      {processingLog.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">处理日志</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {processingLog.map((log, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{log}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        onClick={completePreprocessing}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
      >
        完成并使用处理后的数据
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Settings className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-900">数据预处理</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* 步骤指示器 */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {[
              { key: 'analyze', label: '数据分析', icon: Database },
              { key: 'mapping', label: '字段映射', icon: Target },
              { key: 'preprocess', label: '数据预处理', icon: Zap },
              { key: 'complete', label: '完成', icon: CheckCircle }
            ].map(({ key, label, icon: Icon }) => {
              const status = getStepStatus(key);
              return (
                <div key={key} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    status === 'completed' ? 'bg-green-600 text-white' :
                    status === 'active' ? 'bg-blue-600 text-white' :
                    'bg-gray-300 text-gray-600'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    status === 'active' ? 'text-blue-600' :
                    status === 'completed' ? 'text-green-600' :
                    'text-gray-500'
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 'analyze' && renderAnalysisStep()}
          {currentStep === 'mapping' && renderMappingStep()}
          {currentStep === 'preprocess' && renderPreprocessStep()}
          {currentStep === 'complete' && renderCompleteStep()}
        </div>
      </div>
    </div>
  );
};

export default DataPreprocessor;