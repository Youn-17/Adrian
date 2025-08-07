import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Eye, 
  Trash2,
  ArrowLeft,
  Calendar,
  Database,
  TrendingUp,
  Brain,
  Filter,
  Search
} from 'lucide-react';
import { useAnalyses } from '../hooks/useLocalStorage';
import { toast } from 'sonner';

const Results: React.FC = () => {
  const { id } = useParams();
  const { analyses, deleteAnalysis } = useAnalyses();
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'running' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      const analysis = analyses.find(a => a.id === id);
      setSelectedAnalysis(analysis);
    }
  }, [id, analyses]);

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesStatus = filterStatus === 'all' || analysis.status === filterStatus;
    const matchesSearch = analysis.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (analysis.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (window.confirm('确定要删除这个分析吗？此操作不可恢复。')) {
      try {
        await deleteAnalysis(analysisId);
        toast.success('分析已删除');
        if (selectedAnalysis?.id === analysisId) {
          setSelectedAnalysis(null);
        }
      } catch (error) {
        toast.error('删除失败');
      }
    }
  };

  const exportResults = (analysis: any) => {
    const data = {
      analysis: {
        name: analysis.name,
        description: analysis.description,
        createdAt: analysis.startedAt,
        completedAt: analysis.completedAt,
        parameters: analysis.parameters
      },
      results: analysis.results
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysis.name.replace(/\s+/g, '_')}_results.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('结果已导出');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'running': return '运行中';
      case 'failed': return '失败';
      default: return '未知';
    }
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
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">分析结果</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/analysis" className="text-gray-600 hover:text-gray-900">
                新建分析
              </Link>
              <Link to="/upload" className="text-gray-600 hover:text-gray-900">
                数据上传
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedAnalysis ? (
          /* 分析列表视图 */
          <div className="space-y-6">
            {/* 搜索和筛选 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索分析..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="all">全部状态</option>
                    <option value="completed">已完成</option>
                    <option value="running">运行中</option>
                    <option value="failed">失败</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 分析列表 */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">分析历史</h2>
              </div>
              
              {filteredAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {analyses.length === 0 ? '暂无分析记录' : '没有找到匹配的分析'}
                  </p>
                  <Link 
                    to="/analysis" 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    开始新分析
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredAnalyses.map((analysis) => (
                    <div key={analysis.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{analysis.name}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              getStatusColor(analysis.status)
                            }`}>
                              {getStatusText(analysis.status)}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{analysis.description}</p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              开始时间: {new Date(analysis.startedAt).toLocaleDateString()}
                            </div>
                            {analysis.completedAt && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                完成时间: {new Date(analysis.completedAt).toLocaleDateString()}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Database className="h-4 w-4 mr-1" />
                              数据集: {analysis.datasetIds?.length || 0} 个
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {analysis.status === 'completed' && (
                            <>
                              <button
                                onClick={() => setSelectedAnalysis(analysis)}
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                                title="查看详情"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => exportResults(analysis)}
                                className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                                title="导出结果"
                              >
                                <Download className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteAnalysis(analysis.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                            title="删除分析"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 详细结果视图 */
          <div className="space-y-6">
            {/* 返回按钮和标题 */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回列表
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={() => exportResults(selectedAnalysis)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  导出结果
                </button>
                <Link 
                  to={`/analysis/${selectedAnalysis.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  重新分析
                </Link>
              </div>
            </div>

            {/* 分析信息 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{selectedAnalysis.name}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  getStatusColor(selectedAnalysis.status)
                }`}>
                  {getStatusText(selectedAnalysis.status)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{selectedAnalysis.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-1">开始时间</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedAnalysis.startedAt).toLocaleString()}
                  </p>
                </div>
                {selectedAnalysis.completedAt && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-1">完成时间</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedAnalysis.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-1">数据集数量</h3>
                  <p className="text-sm text-gray-600">
                    {selectedAnalysis.datasetIds?.length || 0} 个数据集
                  </p>
                </div>
              </div>
            </div>

            {/* 分析参数 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">分析参数</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">统计设置</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>置信水平: {(selectedAnalysis.parameters?.confidenceLevel * 100 || 95)}%</li>
                    <li>统计模型: {selectedAnalysis.parameters?.statisticalModel === 'random_effects' ? '随机效应' : '固定效应'}</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">附加分析</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>异质性检验: {selectedAnalysis.parameters?.heterogeneityTest ? '是' : '否'}</li>
                    <li>发表偏倚: {selectedAnalysis.parameters?.publicationBias ? '是' : '否'}</li>
                    <li>亚组分析: {selectedAnalysis.parameters?.subgroupAnalysis ? '是' : '否'}</li>
                    <li>敏感性分析: {selectedAnalysis.parameters?.sensitivityAnalysis ? '是' : '否'}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 分析结果 */}
            {selectedAnalysis.results && (
              <div className="space-y-6">
                {/* 主要结果 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">主要结果</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-6 text-center">
                      <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-blue-900 mb-2">总体效应</h3>
                      <p className="text-3xl font-bold text-blue-600 mb-1">
                        {selectedAnalysis.results.overallEffect?.estimate?.toFixed(3) || 'N/A'}
                      </p>
                      {selectedAnalysis.results.overallEffect?.confidenceInterval && (
                        <p className="text-sm text-blue-700">
                          95% CI: [{selectedAnalysis.results.overallEffect.confidenceInterval[0].toFixed(3)}, 
                          {selectedAnalysis.results.overallEffect.confidenceInterval[1].toFixed(3)}]
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-2">
                        p = {selectedAnalysis.results.overallEffect?.pValue?.toFixed(3) || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-6 text-center">
                      <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-green-900 mb-2">异质性</h3>
                      <p className="text-3xl font-bold text-green-600 mb-1">
                        I² = {selectedAnalysis.results.heterogeneity?.iSquared || 0}%
                      </p>
                      <p className="text-sm text-green-700">
                        {selectedAnalysis.results.heterogeneity?.interpretation || '低异质性'}
                      </p>
                      <p className="text-xs text-green-600 mt-2">
                        Q = {selectedAnalysis.results.heterogeneity?.qStatistic?.toFixed(2) || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-6 text-center">
                      <Database className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="text-lg font-medium text-purple-900 mb-2">研究信息</h3>
                      <p className="text-3xl font-bold text-purple-600 mb-1">
                        {selectedAnalysis.results.studyCount || 0}
                      </p>
                      <p className="text-sm text-purple-700">研究数量</p>
                      <p className="text-xs text-purple-600 mt-2">
                        参与者: {selectedAnalysis.results.totalParticipants || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI解释 */}
                {selectedAnalysis.results.aiInterpretation && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Brain className="h-6 w-6 text-blue-600 mr-2" />
                      AI结果解释
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        {selectedAnalysis.results.aiInterpretation.summary || 
                         selectedAnalysis.results.aiInterpretation || 
                         '分析结果显示统计学显著性，建议进一步验证结果的临床意义。'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 发表偏倚 */}
                {selectedAnalysis.results.publicationBias && (
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">发表偏倚评估</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">Egger检验</h3>
                        <p className="text-sm text-gray-600">
                          p值: {selectedAnalysis.results.publicationBias.eggerTest?.pValue?.toFixed(3) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedAnalysis.results.publicationBias.eggerTest?.interpretation || '无显著发表偏倚'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-2">漏斗图</h3>
                        <p className="text-sm text-gray-600">
                          {selectedAnalysis.results.publicationBias.funnelPlot || '对称分布'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 图表占位符 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">可视化图表</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">森林图</p>
                      <p className="text-sm text-gray-500 mt-1">显示各研究效应量及总体效应</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">漏斗图</p>
                      <p className="text-sm text-gray-500 mt-1">评估发表偏倚</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    图表功能正在开发中，敬请期待
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;