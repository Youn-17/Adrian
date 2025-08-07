import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProjects } from '../hooks/useLocalStorage'
import { ArrowLeft, Save, X, FolderOpen } from 'lucide-react'
import { toast } from 'sonner'

interface ProjectFormData {
  name: string
  description: string
  researchQuestion: string
  inclusionCriteria: string
  exclusionCriteria: string
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate()
  const { createProject } = useProjects()
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    researchQuestion: '',
    inclusionCriteria: '',
    exclusionCriteria: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('项目名称不能为空')
      return
    }

    if (!formData.researchQuestion.trim()) {
      setError('研究问题不能为空')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const project = await createProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        researchQuestion: formData.researchQuestion.trim(),
        inclusionCriteria: formData.inclusionCriteria.trim(),
        exclusionCriteria: formData.exclusionCriteria.trim(),
        status: 'draft'
      })
      
      toast.success('项目创建成功！')
      navigate(`/projects/${project.id}`)
    } catch (err) {
      setError('创建项目时发生错误')
      toast.error('创建项目失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">创建新项目</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 项目名称 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                项目名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="输入项目名称"
                required
              />
            </div>

            {/* 项目描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                项目描述
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="描述您的元分析项目的背景、目标和意义"
              />
            </div>

            {/* 研究问题 */}
            <div>
              <label htmlFor="researchQuestion" className="block text-sm font-medium text-gray-700 mb-2">
                研究问题 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="researchQuestion"
                name="researchQuestion"
                value={formData.researchQuestion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="明确描述您要通过元分析回答的研究问题"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 纳入标准 */}
              <div>
                <label htmlFor="inclusionCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                  纳入标准
                </label>
                <textarea
                  id="inclusionCriteria"
                  name="inclusionCriteria"
                  value={formData.inclusionCriteria}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="定义哪些研究应该被纳入到元分析中，例如：&#10;• 发表时间范围&#10;• 研究设计类型&#10;• 参与者特征&#10;• 干预措施&#10;• 结果指标"
                />
              </div>

              {/* 排除标准 */}
              <div>
                <label htmlFor="exclusionCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                  排除标准
                </label>
                <textarea
                  id="exclusionCriteria"
                  name="exclusionCriteria"
                  value={formData.exclusionCriteria}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="定义哪些研究应该被排除，例如：&#10;• 研究质量不符合要求&#10;• 数据不完整&#10;• 重复发表&#10;• 语言限制&#10;• 特定人群排除"
                />
              </div>
            </div>

            {/* 提示信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">💡 创建提示</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 项目创建后，您可以上传数据集并进行元分析</li>
                <li>• 明确的纳入和排除标准有助于确保分析的科学性和一致性</li>
                <li>• 您可以随时编辑项目信息和标准</li>
                <li>• 支持上传CSV、Excel和Word文档格式的数据</li>
              </ul>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading || !formData.name.trim() || !formData.researchQuestion.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    创建中...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    创建项目
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center mb-4">
            <FolderOpen className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">元分析项目创建指南</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. 明确研究问题</h4>
              <p className="text-sm text-gray-600 mb-4">
                使用PICO框架（Population, Intervention, Comparison, Outcome）来构建清晰的研究问题。
              </p>
              
              <h4 className="font-medium text-gray-900 mb-2">2. 制定纳入排除标准</h4>
              <p className="text-sm text-gray-600">
                基于研究问题制定明确、具体、可操作的纳入和排除标准，确保研究的同质性。
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. 数据准备</h4>
              <p className="text-sm text-gray-600 mb-4">
                准备Web of Science导出的数据文件，或包含研究信息的Excel/Word文档。
              </p>
              
              <h4 className="font-medium text-gray-900 mb-2">4. AI辅助分析</h4>
              <p className="text-sm text-gray-600">
                系统集成DeepSeek AI，可提供数据质量评估、统计方法推荐和结果解释。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProject