import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjects, useDatasets, useAnalyses } from '../hooks/useLocalStorage'
import { 
  Plus, 
  FolderOpen, 
  FileText, 
  Database, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Upload,
  Settings,
  Home,
  Brain
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard: React.FC = () => {
  const { projects } = useProjects()
  const { datasets } = useDatasets()
  const { analyses } = useAnalyses()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟加载时间
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'active':
        return <Clock className="h-4 w-4" />
      case 'draft':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="加载仪表板..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">静态元分析系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900 flex items-center">
                <Home className="h-5 w-5 mr-1" />
                首页
              </Link>
              <Link to="/upload" className="text-gray-600 hover:text-gray-900 flex items-center">
                <Upload className="h-5 w-5 mr-1" />
                数据上传
              </Link>
              <Link to="/analysis" className="text-gray-600 hover:text-gray-900 flex items-center">
                <Brain className="h-5 w-5 mr-1" />
                AI分析
              </Link>
              <Link to="/results" className="text-gray-600 hover:text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-1" />
                结果
              </Link>
              <Link to="settings" className="text-gray-600 hover:text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-1" />
                设置
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
              <p className="text-gray-600 mt-1">
                欢迎使用静态元分析系统！管理您的项目、数据集和分析结果。
              </p>
            </div>
            <Link
              to="/projects/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              新建项目
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 快速统计 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FolderOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总项目数</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">数据集数量</p>
                <p className="text-2xl font-bold text-gray-900">{datasets.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">分析数量</p>
                <p className="text-2xl font-bold text-gray-900">{analyses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已完成分析</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyses.filter(a => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/upload" 
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">上传数据</h3>
            </div>
            <p className="text-gray-600">上传CSV、Excel或Word文档开始分析</p>
          </Link>

          <Link 
            to="/analysis" 
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">AI分析</h3>
            </div>
            <p className="text-gray-600">使用AI进行智能元分析和结果解释</p>
          </Link>

          <Link 
            to="/results" 
            className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 ml-3">查看结果</h3>
            </div>
            <p className="text-gray-600">查看和导出分析结果与可视化图表</p>
          </Link>
        </div>

        {/* 项目列表 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">我的项目</h2>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">还没有项目</h3>
              <p className="text-gray-600 mb-6">创建您的第一个元分析项目开始研究</p>
              <Link
                to="/projects/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                创建项目
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {projects.map((project) => {
                const projectDatasets = datasets.filter(d => d.projectId === project.id)
                const projectAnalyses = analyses.filter(a => a.projectId === project.id)
                return (
                  <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Link
                            to={`/projects/${project.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {project.name}
                          </Link>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            {project.status === 'completed' ? '已完成' : 
                             project.status === 'active' ? '进行中' : '草稿'}
                          </span>
                        </div>
                        
                        {project.description && (
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Database className="h-4 w-4" />
                            <span>{projectDatasets.length} 个数据集</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            <span>{projectAnalyses.length} 个分析</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>{projectAnalyses.filter(a => a.status === 'completed').length} 个已完成</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        <p>创建于 {formatDate(project.createdAt)}</p>
                        <p>更新于 {formatDate(project.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard