import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectsApi, papersApi, datasetsApi, analysisApi } from '../utils/api'
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Database, 
  BarChart3, 
  Plus,
  Search,
  Upload,
  Play,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  research_question: string
  inclusion_criteria: string
  exclusion_criteria: string
  status: string
  created_at: string
  updated_at: string
}

interface Paper {
  id: string
  title: string
  authors: string
  journal: string
  year: number
  status: string
  quality_score: number
  created_at: string
}

interface Dataset {
  id: string
  name: string
  file_name: string
  file_size: number
  row_count: number
  status: string
  created_at: string
}

interface Analysis {
  id: string
  name: string
  analysis_type: string
  status: string
  created_at: string
  completed_at: string
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [papers, setPapers] = useState<Paper[]>([])
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchProjectData()
    }
  }, [id])

  const fetchProjectData = async () => {
    try {
      setLoading(true)
      
      // 并行获取项目数据
      const [projectResponse, papersResponse, datasetsResponse, analysesResponse] = await Promise.all([
        projectsApi.getById(id!),
        papersApi.getByProject(id!, { limit: 10 }),
        datasetsApi.getByProject(id!),
        analysisApi.getByProject(id!)
      ])

      if (projectResponse.success) {
        setProject(projectResponse.project)
      }
      
      if (papersResponse.success) {
        setPapers(papersResponse.papers)
      }
      
      if (datasetsResponse.success) {
        setDatasets(datasetsResponse.datasets)
      }
      
      if (analysesResponse.success) {
        setAnalyses(analysesResponse.analyses)
      }
    } catch (err) {
      setError('Failed to fetch project data')
    } finally {
      setLoading(false)
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
                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600 mt-1">
                  创建于 {formatDate(project.created_at)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                {project.status === 'completed' ? '已完成' : 
                 project.status === 'active' ? '进行中' : '草稿'}
              </span>
              <Link
                to={`/projects/${id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                编辑项目
              </Link>
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
              {[
                { id: 'overview', name: '概览', icon: Eye },
                { id: 'papers', name: '论文', icon: FileText },
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

                {project.research_question && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">研究问题</h3>
                    <p className="text-gray-700">{project.research_question}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.inclusion_criteria && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">纳入标准</h3>
                      <p className="text-gray-700">{project.inclusion_criteria}</p>
                    </div>
                  )}

                  {project.exclusion_criteria && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">排除标准</h3>
                      <p className="text-gray-700">{project.exclusion_criteria}</p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-blue-600">论文总数</p>
                        <p className="text-2xl font-bold text-blue-900">{papers.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <Database className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-green-600">数据集总数</p>
                        <p className="text-2xl font-bold text-green-900">{datasets.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <div className="flex items-center">
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-purple-600">分析总数</p>
                        <p className="text-2xl font-bold text-purple-900">{analyses.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Papers Tab */}
            {activeTab === 'papers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">论文管理</h3>
                  <div className="flex gap-3">
                    <Link
                      to={`/projects/${id}/papers/search`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Search className="h-4 w-4" />
                      搜索论文
                    </Link>
                    <Link
                      to={`/projects/${id}/papers/add`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      添加论文
                    </Link>
                  </div>
                </div>

                {papers.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">还没有论文</h4>
                    <p className="text-gray-600 mb-6">开始添加论文到您的Meta分析项目</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {papers.map((paper) => (
                      <div key={paper.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{paper.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {paper.authors} • {paper.journal} • {paper.year}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(paper.status)}`}>
                                {getStatusIcon(paper.status)}
                                {paper.status === 'included' ? '已纳入' : 
                                 paper.status === 'excluded' ? '已排除' : '待审核'}
                              </span>
                              {paper.quality_score && (
                                <span className="text-xs text-gray-500">
                                  质量评分: {paper.quality_score}/10
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/projects/${id}/papers/${paper.id}`}
                              className="text-blue-600 hover:text-blue-700 p-1"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button className="text-red-600 hover:text-red-700 p-1">
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

            {/* Datasets Tab */}
            {activeTab === 'datasets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">数据集管理</h3>
                  <Link
                    to={`/projects/${id}/datasets/upload`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    上传数据集
                  </Link>
                </div>

                {datasets.length === 0 ? (
                  <div className="text-center py-12">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">还没有数据集</h4>
                    <p className="text-gray-600 mb-6">上传您的研究数据开始分析</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {datasets.map((dataset) => (
                      <div key={dataset.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{dataset.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              文件: {dataset.file_name} • 大小: {formatFileSize(dataset.file_size)} • {dataset.row_count} 行数据
                            </p>
                            <div className="flex items-center gap-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dataset.status)}`}>
                                {getStatusIcon(dataset.status)}
                                {dataset.status === 'processed' ? '已处理' : 
                                 dataset.status === 'uploaded' ? '已上传' : '错误'}
                              </span>
                              <span className="text-xs text-gray-500">
                                上传于 {formatDate(dataset.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/projects/${id}/datasets/${dataset.id}`}
                              className="text-blue-600 hover:text-blue-700 p-1"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button className="text-red-600 hover:text-red-700 p-1">
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
                    to={`/projects/${id}/analyses/new`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    新建分析
                  </Link>
                </div>

                {analyses.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">还没有分析</h4>
                    <p className="text-gray-600 mb-6">创建您的第一个Meta分析</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {analyses.map((analysis) => (
                      <div key={analysis.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{analysis.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">
                              类型: {analysis.analysis_type === 'fixed_effect' ? '固定效应模型' : '随机效应模型'}
                            </p>
                            <div className="flex items-center gap-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(analysis.status)}`}>
                                {getStatusIcon(analysis.status)}
                                {analysis.status === 'completed' ? '已完成' : 
                                 analysis.status === 'running' ? '运行中' : 
                                 analysis.status === 'failed' ? '失败' : '待运行'}
                              </span>
                              <span className="text-xs text-gray-500">
                                创建于 {formatDate(analysis.created_at)}
                              </span>
                              {analysis.completed_at && (
                                <span className="text-xs text-gray-500">
                                  完成于 {formatDate(analysis.completed_at)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {analysis.status === 'pending' && (
                              <button className="text-green-600 hover:text-green-700 p-1">
                                <Play className="h-4 w-4" />
                              </button>
                            )}
                            <Link
                              to={`/projects/${id}/analyses/${analysis.id}`}
                              className="text-blue-600 hover:text-blue-700 p-1"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button className="text-red-600 hover:text-red-700 p-1">
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