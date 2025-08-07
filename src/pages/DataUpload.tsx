import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  X,
  Download,
  ArrowLeft,
  Brain,
  BarChart3
} from 'lucide-react';
import { useFileProcessor } from '../hooks/useFileProcessor';
import { useDatasets } from '../hooks/useLocalStorage';
import { toast } from 'sonner';

const DataUpload: React.FC = () => {
  const { processFiles, isProcessing, error, clearError } = useFileProcessor();
  const { createDataset } = useDatasets();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'save'>('upload');

  const supportedFormats = [
    {
      type: 'CSV',
      description: 'Web of Science导出的CSV文件',
      icon: <Database className="h-6 w-6 text-blue-600" />,
      extensions: '.csv'
    },
    {
      type: 'Excel',
      description: 'Excel工作簿文件 (.xlsx, .xls)',
      icon: <FileText className="h-6 w-6 text-green-600" />,
      extensions: '.xlsx, .xls'
    },
    {
      type: 'Word',
      description: 'Word文档文件 (.docx)',
      icon: <FileText className="h-6 w-6 text-orange-600" />,
      extensions: '.docx'
    }
  ];

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(file => {
      const extension = file.name.toLowerCase();
      return extension.endsWith('.csv') || 
             extension.endsWith('.xlsx') || 
             extension.endsWith('.xls') || 
             extension.endsWith('.docx');
    });

    if (validFiles.length === 0) {
      toast.error('请上传支持的文件格式：CSV、Excel或Word文档');
      return;
    }

    setUploadedFiles(validFiles);
    
    try {
      const results = await processFiles(validFiles);
      setProcessedData(results);
      setCurrentStep('preview');
      toast.success(`成功处理 ${validFiles.length} 个文件`);
    } catch (err) {
      toast.error('文件处理失败，请检查文件格式');
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    
    if (newFiles.length === 0) {
      setProcessedData([]);
      setCurrentStep('upload');
    }
  };

  const saveDatasets = async () => {
    try {
      for (let i = 0; i < processedData.length; i++) {
        const data = processedData[i];
        const file = uploadedFiles[i];
        
        await createDataset({
          name: file.name.replace(/\.[^/.]+$/, ''),
          description: `从 ${file.name} 导入的数据`,
          fileName: file.name,
          fileType: (file.name.split('.').pop()?.toLowerCase() || 'unknown') as 'csv' | 'excel' | 'word' | 'xlsx' | 'xls' | 'docx' | 'unknown',
          fileSize: file.size,
          rowCount: data.data?.length || 0,
          columnCount: data.data?.[0] ? Object.keys(data.data[0]).length : 0,
          recordCount: data.data?.length || 0,
          createdAt: new Date().toISOString(),
          status: 'processed' as const,
          data: data.data,
          metadata: data.metadata,
          projectId: null // 暂时不关联项目
        });
      }
      
      toast.success('数据集保存成功！');
      setCurrentStep('save');
    } catch (err) {
      toast.error('保存数据集失败');
    }
  };

  const resetUpload = () => {
    setUploadedFiles([]);
    setProcessedData([]);
    setCurrentStep('upload');
    clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回首页
              </Link>
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">数据上传</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-gray-900"
              >
                仪表板
              </Link>
              <Link 
                to="/analysis" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                开始分析
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center ${
              currentStep === 'upload' ? 'text-blue-600' : 
              currentStep === 'preview' || currentStep === 'save' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'upload' ? 'bg-blue-600 text-white' : 
                currentStep === 'preview' || currentStep === 'save' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">上传文件</span>
            </div>
            <div className={`w-16 h-1 ${
              currentStep === 'preview' || currentStep === 'save' ? 'bg-green-600' : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center ${
              currentStep === 'preview' ? 'text-blue-600' : 
              currentStep === 'save' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'preview' ? 'bg-blue-600 text-white' : 
                currentStep === 'save' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">预览数据</span>
            </div>
            <div className={`w-16 h-1 ${
              currentStep === 'save' ? 'bg-green-600' : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center ${
              currentStep === 'save' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'save' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">保存数据</span>
            </div>
          </div>
        </div>

        {/* 上传步骤 */}
        {currentStep === 'upload' && (
          <div className="space-y-8">
            {/* 支持格式说明 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">支持的文件格式</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {supportedFormats.map((format, index) => (
                  <div key={index} className="flex items-start p-4 border border-gray-200 rounded-lg">
                    <div className="mr-3">{format.icon}</div>
                    <div>
                      <h3 className="font-medium text-gray-900">{format.type}</h3>
                      <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{format.extensions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 文件上传区域 */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div 
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  拖拽文件到此处或点击上传
                </h3>
                <p className="text-gray-600 mb-4">
                  支持 CSV、Excel (.xlsx, .xls) 和 Word (.docx) 文件
                </p>
                <input
                  type="file"
                  multiple
                  accept=".csv,.xlsx,.xls,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                >
                  选择文件
                </label>
              </div>
            </div>

            {/* 已上传文件列表 */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">已上传文件</h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* 处理按钮 */}
            {uploadedFiles.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleFiles(uploadedFiles)}
                  disabled={isProcessing}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      处理中...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      开始处理文件
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 预览步骤 */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">数据预览</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={resetUpload}
                    className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    重新上传
                  </button>
                  <button
                    onClick={saveDatasets}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    保存数据集
                  </button>
                </div>
              </div>
              
              {processedData.map((data, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    {uploadedFiles[index]?.name}
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{data.data?.length || 0}</p>
                        <p className="text-sm text-gray-600">记录数</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {data.data?.[0] ? Object.keys(data.data[0]).length : 0}
                        </p>
                        <p className="text-sm text-gray-600">字段数</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {data.metadata?.fileType || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">文件类型</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {((uploadedFiles[index]?.size || 0) / 1024 / 1024).toFixed(1)}MB
                        </p>
                        <p className="text-sm text-gray-600">文件大小</p>
                      </div>
                    </div>
                    
                    {data.data && data.data.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              {Object.keys(data.data[0]).slice(0, 6).map((key) => (
                                <th key={key} className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.data.slice(0, 5).map((row: any, rowIndex: number) => (
                              <tr key={rowIndex} className="border-b">
                                {Object.keys(row).slice(0, 6).map((key) => (
                                  <td key={key} className="px-4 py-2 text-sm text-gray-700">
                                    {String(row[key]).length > 50 
                                      ? String(row[key]).substring(0, 50) + '...' 
                                      : String(row[key])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {data.data.length > 5 && (
                          <p className="text-sm text-gray-600 mt-2 text-center">
                            显示前5行，共{data.data.length}行数据
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 保存完成步骤 */}
        {currentStep === 'save' && (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">数据保存成功！</h2>
            <p className="text-gray-600 mb-8">
              您的数据已成功保存到本地存储，现在可以开始进行元分析了。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/dashboard" 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看仪表板
              </Link>
              <Link 
                to="/analysis" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                开始分析
              </Link>
              <button
                onClick={resetUpload}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                上传更多文件
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUpload;