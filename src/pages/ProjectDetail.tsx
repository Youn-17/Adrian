import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useProjects, useDatasets, useAnalyses } from '../hooks/useLocalStorage'
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Database, 
  BarChart3, 
  Plus,
  Upload,
  Play,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Home,
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

import type { Project, Dataset, Analysis } from '../types'

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { projects, deleteProject } = useProjects()
  const { datasets, deleteDataset } = useDatasets()
  const { analyses, deleteAnalysis } = useAnalyses()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const project = projects.find(p => p.id === id)
  const projectDatasets = datasets.filter(d => d.projectId === id)
  const projectAnalyses = analyses.filter(a => a.projectId === id)

  useEffect(() => {
    // 模拟加载延迟
    const timer = setTimeout(() => {
      setLoading(false)
      if (!project) {
        setError('项目未找到')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [project])

  const handleDeleteDataset = async (datasetId: string) => {
    if (window.confirm('确定要删除这个数据集吗？')) {
      try {
        await deleteDataset(datasetId)
        toast.success('数据集删除成功')
      } catch (err) {
        toast.error('删除数据集失败')
      }
    }
  }

  const handleDeleteAnalysis = async (analysisId: string) => {
    if (window.confirm('确定要删除这个分析吗？')) {
      try {
        await deleteAnalysis(analysisId)
        toast.success('分析删除成功')
      } catch (err) {
        toast.error('删除分析失败')
      }
    }
  }

  const handleDeleteProject = async () => {
    if (window.confirm('确定要删除这个项目吗？这将同时删除所有相关的数据集和分析。')) {
      try {
        await deleteProject(id!)
        toast.success('项目删除成功')
        navigate('/dashboard')
      } catch (err) {
        toast.error('删除项目失败')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'included':
      case 'processed':
        return 'text-green-600 bg-green-100'
      case 'active':
      case 'running':
      case 'pending':
        return 'text-blue-600 bg-blue-100'
      case 'excluded':
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'draft':
      case 'uploaded':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'included':
      case 'processed':
        return <CheckCircle className="h-4 w-4" />
      case 'excluded':
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'running':
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">项目未找到</h2>
          <p className="text-gray-600 mb-4">请检查项目ID是否正确</p>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
            返回仪表板
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">元分析系统</span>
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link to="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  首页
                </Link>
                <Link to="/dashboard" className="text-blue-600 px-3 py-2 text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  仪表板
                </Link>
                <Link to="/upload" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  数据上传
                </Link>
                <Link to="/analysis" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  AI分析
                </Link>
                <Link to="/results" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  结果查看
                </Link>
                <Link to="settings" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  设置
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-600 mt-1">
                  创建于 {formatDate(project.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                {project.status === 'completed' ? '已完成' : 
                 project.status === 'active' ? '进行中' : '草稿'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteProject}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  删除项目
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[{ id: 'overview', name: '概览', icon: Eye },
                { id: 'datasets', name: '数据集', icon: Database },
                { id: 'analyses', name: '分析', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {project.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">项目描述</h3>
                    <p className="text-gray-700">{project.description}</p>
                  </div>
                )}

                {project.researchQuestion && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">研究问题</h3>
                    <p className="text-gray-700">{project.researchQuestion}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.inclusionCriteria && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">纳入标准</h3>
                      <p className="text-gray-700">{project.inclusionCriteria}</p>
                    </div>
                  )}

                  {project.exclusionCriteria && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">排除标准</h3>
                      <p className="text-gray-700">{project.exclusionCriteria}</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Database className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">数据集总数</p>
                        <p className="text-2xl font-bold text-green-900">{projectDatasets.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">分析总数</p>
                        <p className="text-2xl font-bold text-purple-900">{projectAnalyses.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Link
                    to="/upload"
                    className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    <Upload className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">上传数据</div>
                    <div className="text-sm opacity-90">添加新的数据集</div>
                  </Link>
                  <Link
                    to="/analysis"
                    className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    <BarChart3 className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">开始分析</div>
                    <div className="text-sm opacity-90">AI辅助元分析</div>
                  </Link>
                  <Link
                    to="/results"
                    className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
                  >
                    <FileText className="h-6 w-6 mx-auto mb-2" />
                    <div className="font-medium">查看结果</div>
                    <div className="text-sm opacity-90">分析结果和报告</div>
                  </Link>
                </div>
              </div>
            )}



            {/* Datasets Tab */}
            {activeTab === 'datasets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">数据集管理</h3>
                  <Link
                    to="/upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    上传数据集
                  </Link>
                </div>

                {projectDatasets.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">还没有数据集</h4>
                    <p className="text-gray-600 mb-6">上传您的研究数据开始分析</p>
                    <Link
                      to="/upload"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      立即上传
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectDatasets.map((dataset) => (
                      <div key={dataset.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{dataset.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              文件: {dataset.fileName} • 大小: {formatFileSize(dataset.fileSize)} • {dataset.rowCount} 行数据
                            </p>
                            <div className="flex items-center gap-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dataset.status)}`}>
                                {getStatusIcon(dataset.status)}
                                {dataset.status === 'processed' ? '已处理' : 
                                 dataset.status === 'uploaded' ? '已上传' : '错误'}
                              </span>
                              <span className="text-xs text-gray-500">
                                上传于 {formatDate(dataset.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteDataset(dataset.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="删除数据集"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analyses Tab */}
            {activeTab === 'analyses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">分析管理</h3>
                  <Link
                    to="/analysis"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    新建分析
                  </Link>
                </div>

                {projectAnalyses.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">还没有分析</h4>
                    <p className="text-gray-600 mb-6">创建您的第一个元分析</p>
                    <Link
                      to="/analysis"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      开始分析
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectAnalyses.map((analysis) => (
                      <div key={analysis.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{analysis.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              类型: {analysis.parameters?.analysisType === 'fixed_effect' ? '固定效应模型' : '随机效应模型'}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                                {getStatusIcon(analysis.status)}
                                {analysis.status === 'completed' ? '已完成' : 
                                 analysis.status === 'running' ? '运行中' : 
                                 analysis.status === 'failed' ? '失败' : '待运行'}
                              </span>
                              <span className="text-xs text-gray-500">
                                创建于 {formatDate(analysis.createdAt)}
                              </span>
                              {analysis.completedAt && (
                                <span className="text-xs text-gray-500">
                                  完成于 {formatDate(analysis.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to="/results"
                              className="text-blue-600 hover:text-blue-700 p-1"
                              title="查看结果"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteAnalysis(analysis.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="删除分析"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail