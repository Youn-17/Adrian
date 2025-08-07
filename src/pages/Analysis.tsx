import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Brain, 
  BarChart3, 
  FileText, 
  Settings, 
  Play, 
  Pause, 
  Download,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Database
} from 'lucide-react';
import { useDatasets, useAnalyses } from '../hooks/useLocalStorage';
import { useDeepSeek } from '../hooks/useDeepSeek';
import { toast } from 'sonner';

interface AnalysisConfig {
  confidenceLevel: number;
  statisticalModel: 'fixed_effects' | 'random_effects';
  heterogeneityTest: boolean;
  publicationBias: boolean;
  subgroupAnalysis: boolean;
  sensitivityAnalysis: boolean;
}

const Analysis: React.FC = () => {
  const { id } = useParams();
  const { datasets } = useDatasets();
  const { analyses, createAnalysis, updateAnalysis } = useAnalyses();
  const { 
    assessDataQuality, 
    interpretResults,
    isLoading: aiLoading 
  } = useDeepSeek();
  
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);
  const [analysisConfig, setAnalysisConfig] = useState<AnalysisConfig>({
    confidenceLevel: 0.95,
    statisticalModel: 'random_effects',
    heterogeneityTest: true,
    publicationBias: true,
    subgroupAnalysis: false,
    sensitivityAnalysis: false
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [analysisStep, setAnalysisStep] = useState<'setup' | 'quality' | 'methods' | 'running' | 'results'>('setup');
  const [qualityAssessment, setQualityAssessment] = useState<any>(null);
  const [methodRecommendations, setMethodRecommendations] = useState<any>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const analysis = analyses.find(a => a.id === id);
      if (analysis) {
        setCurrentAnalysis(analysis);
        setSelectedDatasets(analysis.datasetIds);
        setAnalysisConfig(analysis.parameters as AnalysisConfig);
        if (analysis.status === 'completed' && analysis.results) {
          setAnalysisResults(analysis.results);
          setAnalysisStep('results');
        }
      }
    }
  }, [id, analyses]);

  const handleDatasetSelection = (datasetId: string) => {
    setSelectedDatasets(prev => 
      prev.includes(datasetId) 
        ? prev.filter(id => id !== datasetId)
        : [...prev, datasetId]
    );
  };

  const startQualityAssessment = async () => {
    if (selectedDatasets.length === 0) {
      toast.error('请至少选择一个数据集');
      return;
    }

    setAnalysisStep('quality');
    
    try {
      const selectedData = datasets.filter(d => selectedDatasets.includes(d.id));
      const combinedData = selectedData.flatMap(d => d.data || []);
      
      const assessment = await assessDataQuality({
        studies: combinedData.map((study, index) => ({
          id: `study_${index}`,
          title: study.title || `研究 ${index + 1}`,
          author: study.author || '未知作者',
          year: study.year || new Date().getFullYear(),
          sampleSize: study.sampleSize || study.participants || 0,
          effectSize: study.effectSize || 0,
          standardError: study.standardError || 0
        })),
        overallEffect: 0.45,
        confidenceInterval: [0.23, 0.67] as [number, number],
        heterogeneity: {
          qStatistic: 12.5,
          iSquared: 45,
          pValue: 0.05
        }
      });
      
      setQualityAssessment(assessment);
      toast.success('数据质量评估完成');
    } catch (error) {
      toast.error('数据质量评估失败');
      setAnalysisStep('setup');
    }
  };

  const getMethodRecommendations = async () => {
    if (!qualityAssessment) return;
    
    setAnalysisStep('methods');
    
    try {
      const selectedData = datasets.filter(d => selectedDatasets.includes(d.id));
      const combinedData = selectedData.flatMap(d => d.data || []);
      
      const recommendations = {
        recommendation: '推荐使用随机效应模型进行元分析。',
        rationale: '基于数据特征和研究设计，随机效应模型更适合处理研究间的异质性。',
        considerations: '建议进行异质性检验和发表偏倚评估。'
      };
      
      setMethodRecommendations(recommendations);
      toast.success('统计方法推荐完成');
    } catch (error) {
      toast.error('获取方法推荐失败');
      setAnalysisStep('quality');
    }
  };

  const runAnalysis = async () => {
    setAnalysisStep('running');
    
    try {
      // 创建或更新分析记录
      let analysisId = currentAnalysis?.id;
      
      if (!analysisId) {
        const newAnalysis = await createAnalysis({
          name: `元分析 - ${new Date().toLocaleDateString()}`,
          description: '自动生成的元分析',
          datasetIds: selectedDatasets,
          parameters: analysisConfig,
          status: 'running',
          createdAt: new Date().toISOString(),
          projectId: null
        });
        analysisId = newAnalysis.id;
        setCurrentAnalysis(newAnalysis);
      } else {
        await updateAnalysis(analysisId, {
          status: 'running',
          parameters: analysisConfig
        });
      }
      
      // 模拟分析过程
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 生成模拟结果
      const mockResults = {
        overallEffect: {
          estimate: 0.45,
          confidenceInterval: [0.23, 0.67] as [number, number],
          pValue: 0.001,
          significance: 'significant'
        },
        heterogeneity: {
          iSquared: 65,
          qStatistic: 12.5,
          pValue: 0.02,
          interpretation: 'moderate heterogeneity'
        },
        publicationBias: {
          eggerTest: {
            pValue: 0.15,
            interpretation: 'no significant bias detected'
          },
          funnelPlot: 'symmetrical'
        },
        studyCount: selectedDatasets.length,
        totalParticipants: datasets
          .filter(d => selectedDatasets.includes(d.id))
          .reduce((sum, d) => sum + (d.recordCount || 0), 0)
      };
      
      // 获取AI解释
      const metaAnalysisData = {
        studies: [],
        overallEffect: mockResults.overallEffect.estimate,
        confidenceInterval: mockResults.overallEffect.confidenceInterval,
        heterogeneity: {
          qStatistic: mockResults.heterogeneity.qStatistic,
          iSquared: mockResults.heterogeneity.iSquared,
          pValue: mockResults.heterogeneity.pValue
        }
      };
      const interpretation = await interpretResults(metaAnalysisData);
      
      const finalResults = {
        ...mockResults,
        aiInterpretation: interpretation.interpretation || '分析完成'
      };
      
      setAnalysisResults(finalResults);
      
      // 更新分析状态
      await updateAnalysis(analysisId, {
        status: 'completed',
        results: finalResults
      });
      
      setAnalysisStep('results');
      toast.success('分析完成！');
      
    } catch (error) {
      toast.error('分析过程中出现错误');
      setAnalysisStep('methods');
    }
  };

  const resetAnalysis = () => {
    setAnalysisStep('setup');
    setQualityAssessment(null);
    setMethodRecommendations(null);
    setAnalysisResults(null);
    setCurrentAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回仪表板
              </Link>
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">AI元分析</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/upload" className="text-gray-600 hover:text-gray-900">
                数据上传
              </Link>
              <Link to="/results" className="text-gray-600 hover:text-gray-900">
                分析结果
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 步骤指示器 */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[
              { key: 'setup', label: '设置', icon: Settings },
              { key: 'quality', label: '质量评估', icon: CheckCircle },
              { key: 'methods', label: '方法推荐', icon: Brain },
              { key: 'running', label: '运行分析', icon: Play },
              { key: 'results', label: '查看结果', icon: BarChart3 }
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = analysisStep === step.key;
              const isCompleted = ['setup', 'quality', 'methods', 'running'].indexOf(step.key) < 
                                ['setup', 'quality', 'methods', 'running', 'results'].indexOf(analysisStep);
              
              return (
                <React.Fragment key={step.key}>
                  <div className={`flex items-center ${
                    isActive ? 'text-blue-600' : 
                    isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white' : 
                      isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="ml-2 font-medium hidden sm:block">{step.label}</span>
                  </div>
                  {index < 4 && (
                    <div className={`w-12 h-1 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 设置步骤 */}
        {analysisStep === 'setup' && (
          <div className="space-y-6">
            {/* 数据集选择 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">选择数据集</h2>
              {datasets.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">暂无可用数据集</p>
                  <Link 
                    to="/upload" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    上传数据
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {datasets.map((dataset) => (
                    <div 
                      key={dataset.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedDatasets.includes(dataset.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleDatasetSelection(dataset.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{dataset.name}</h3>
                        {selectedDatasets.includes(dataset.id) && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{dataset.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{dataset.recordCount} 条记录</span>
                        <span>{dataset.fileType?.toUpperCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 分析配置 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">分析配置</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    置信水平
                  </label>
                  <select 
                    value={analysisConfig.confidenceLevel}
                    onChange={(e) => setAnalysisConfig(prev => ({
                      ...prev, 
                      confidenceLevel: parseFloat(e.target.value)
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value={0.90}>90%</option>
                    <option value={0.95}>95%</option>
                    <option value={0.99}>99%</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    统计模型
                  </label>
                  <select 
                    value={analysisConfig.statisticalModel}
                    onChange={(e) => setAnalysisConfig(prev => ({
                      ...prev, 
                      statisticalModel: e.target.value as 'fixed_effects' | 'random_effects'
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="random_effects">随机效应模型</option>
                    <option value="fixed_effects">固定效应模型</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  附加分析
                </label>
                <div className="space-y-3">
                  {[
                    { key: 'heterogeneityTest', label: '异质性检验' },
                    { key: 'publicationBias', label: '发表偏倚检验' },
                    { key: 'subgroupAnalysis', label: '亚组分析' },
                    { key: 'sensitivityAnalysis', label: '敏感性分析' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={analysisConfig[option.key as keyof AnalysisConfig] as boolean}
                        onChange={(e) => setAnalysisConfig(prev => ({
                          ...prev,
                          [option.key]: e.target.checked
                        }))}
                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 开始按钮 */}
            <div className="flex justify-center">
              <button
                onClick={startQualityAssessment}
                disabled={selectedDatasets.length === 0 || aiLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    处理中...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    开始AI分析
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 质量评估步骤 */}
        {analysisStep === 'quality' && qualityAssessment && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">数据质量评估</h2>
            <div className="prose max-w-none">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">AI评估结果</h3>
                <p className="text-blue-800">{qualityAssessment.summary || '数据质量良好，适合进行元分析。'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">数据完整性</h4>
                  <p className="text-sm text-gray-600">{qualityAssessment.completeness || '数据完整性良好'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">研究质量</h4>
                  <p className="text-sm text-gray-600">{qualityAssessment.studyQuality || '研究质量符合标准'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={resetAnalysis}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg"
              >
                重新开始
              </button>
              <button
                onClick={getMethodRecommendations}
                disabled={aiLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    获取推荐...
                  </>
                ) : (
                  '获取方法推荐'
                )}
              </button>
            </div>
          </div>
        )}

        {/* 方法推荐步骤 */}
        {analysisStep === 'methods' && methodRecommendations && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">AI方法推荐</h2>
            <div className="prose max-w-none">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium text-green-900 mb-2">推荐的统计方法</h3>
                <p className="text-green-800">{methodRecommendations.recommendation || '推荐使用随机效应模型进行元分析。'}</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">推荐理由</h4>
                  <p className="text-sm text-gray-600">{methodRecommendations.rationale || '基于数据特征和研究设计，随机效应模型更适合处理研究间的异质性。'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">注意事项</h4>
                  <p className="text-sm text-gray-600">{methodRecommendations.considerations || '建议进行异质性检验和发表偏倚评估。'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setAnalysisStep('quality')}
                className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg"
              >
                返回上一步
              </button>
              <button
                onClick={runAnalysis}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Play className="h-5 w-5 mr-2" />
                运行分析
              </button>
            </div>
          </div>
        )}

        {/* 运行分析步骤 */}
        {analysisStep === 'running' && (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">正在运行分析...</h2>
            <p className="text-gray-600">AI正在处理您的数据，请稍候。这可能需要几分钟时间。</p>
          </div>
        )}

        {/* 结果步骤 */}
        {analysisStep === 'results' && analysisResults && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">分析结果</h2>
                <div className="flex space-x-3">
                  <button className="text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    导出报告
                  </button>
                  <Link 
                    to="/results" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    查看详细结果
                  </Link>
                </div>
              </div>
              
              {/* 主要结果 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">总体效应</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {analysisResults.overallEffect.estimate.toFixed(3)}
                  </p>
                  <p className="text-sm text-blue-700">
                    95% CI: [{analysisResults.overallEffect.confidenceInterval[0].toFixed(3)}, 
                    {analysisResults.overallEffect.confidenceInterval[1].toFixed(3)}]
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <h3 className="text-lg font-medium text-green-900 mb-2">异质性</h3>
                  <p className="text-2xl font-bold text-green-600">
                    I² = {analysisResults.heterogeneity.iSquared}%
                  </p>
                  <p className="text-sm text-green-700">
                    {analysisResults.heterogeneity.interpretation}
                  </p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <h3 className="text-lg font-medium text-purple-900 mb-2">研究数量</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {analysisResults.studyCount}
                  </p>
                  <p className="text-sm text-purple-700">
                    总参与者: {analysisResults.totalParticipants}
                  </p>
                </div>
              </div>
              
              {/* AI解释 */}
              {analysisResults.aiInterpretation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-yellow-900 mb-2 flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI结果解释
                  </h3>
                  <p className="text-yellow-800">{analysisResults.aiInterpretation.summary || '分析结果显示统计学显著性，建议进一步验证。'}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={resetAnalysis}
                className="text-gray-600 hover:text-gray-800 px-6 py-2 border border-gray-300 rounded-lg"
              >
                新建分析
              </button>
              <Link 
                to="/results" 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看所有结果
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;