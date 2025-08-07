const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// API请求工具函数
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// 项目相关API
export const projectsApi = {
  // 获取所有项目
  getAll: () => apiRequest('/projects'),
  
  // 获取单个项目
  getById: (id: string) => apiRequest(`/projects/${id}`),
  
  // 创建项目
  create: (data: {
    title: string
    description?: string
    research_question?: string
    inclusion_criteria?: string
    exclusion_criteria?: string
  }) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // 更新项目
  update: (id: string, data: {
    title?: string
    description?: string
    research_question?: string
    inclusion_criteria?: string
    exclusion_criteria?: string
    status?: string
  }) => apiRequest(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // 删除项目
  delete: (id: string) => apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  }),
  
  // 获取项目统计
  getStats: (id: string) => apiRequest(`/projects/${id}/stats`),
}

// 论文相关API
export const papersApi = {
  // 获取项目的论文
  getByProject: (projectId: string, params?: {
    status?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.append('status', params.status)
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const queryString = searchParams.toString()
    return apiRequest(`/papers/project/${projectId}${queryString ? `?${queryString}` : ''}`)
  },
  
  // 获取单个论文
  getById: (id: string) => apiRequest(`/papers/${id}`),
  
  // 手动添加论文
  create: (data: {
    project_id: string
    title: string
    authors?: string
    journal?: string
    year?: number
    doi?: string
    abstract?: string
    keywords?: string
    url?: string
  }) => apiRequest('/papers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // 更新论文
  update: (id: string, data: {
    status?: string
    classification_reason?: string
    quality_score?: number
  }) => apiRequest(`/papers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  // 删除论文
  delete: (id: string) => apiRequest(`/papers/${id}`, {
    method: 'DELETE',
  }),
  
  // 搜索论文
  search: (data: {
    query: string
    project_id: string
    limit?: number
  }) => apiRequest('/papers/search', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // 批量导入论文
  import: (data: {
    papers: any[]
    project_id: string
  }) => apiRequest('/papers/import', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // 获取论文分类历史
  getClassifications: (id: string) => apiRequest(`/papers/${id}/classifications`),
}

// 数据集相关API
export const datasetsApi = {
  // 上传数据集
  upload: (formData: FormData) => {
    const token = localStorage.getItem('token')
    return fetch(`${API_BASE_URL}/uploads/dataset`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        })
      }
      return response.json()
    })
  },
  
  // 获取项目的数据集
  getByProject: (projectId: string) => apiRequest(`/uploads/datasets/${projectId}`),
  
  // 获取数据集详情
  getById: (id: string, params?: {
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    
    const queryString = searchParams.toString()
    return apiRequest(`/uploads/dataset/${id}${queryString ? `?${queryString}` : ''}`)
  },
  
  // 处理数据集
  process: (id: string, data: {
    remove_duplicates?: boolean
    handle_missing_values?: string
    required_columns?: string[]
  }) => apiRequest(`/uploads/dataset/${id}/process`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // 删除数据集
  delete: (id: string) => apiRequest(`/uploads/dataset/${id}`, {
    method: 'DELETE',
  }),
}

// 分析相关API
export const analysisApi = {
  // 创建分析
  create: (data: {
    project_id: string
    name: string
    description?: string
    analysis_type?: string
    dataset_ids?: string[]
    effect_size_column?: string
    variance_column?: string
    study_column?: string
  }) => apiRequest('/analysis', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  // 运行分析
  run: (id: string) => apiRequest(`/analysis/${id}/run`, {
    method: 'POST',
  }),
  
  // 获取项目的分析
  getByProject: (projectId: string) => apiRequest(`/analysis/project/${projectId}`),
  
  // 获取分析详情
  getById: (id: string) => apiRequest(`/analysis/${id}`),
  
  // 获取分析结果
  getResults: (id: string) => apiRequest(`/analysis/${id}/results`),
  
  // 删除分析
  delete: (id: string) => apiRequest(`/analysis/${id}`, {
    method: 'DELETE',
  }),
}

// 用户相关API
export const usersApi = {
  // 获取当前用户信息
  getCurrentUser: () => apiRequest('/auth/me'),
  
  // 更新用户资料
  updateProfile: (data: {
    name?: string
    email?: string
    institution?: string
    bio?: string
  }) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
}

export default {
  projectsApi,
  papersApi,
  datasetsApi,
  analysisApi,
  usersApi,
}