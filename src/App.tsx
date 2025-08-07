import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import ProjectDetail from './pages/ProjectDetail'
import DataUpload from './pages/DataUpload'
import Analysis from './pages/Analysis'
import Results from './pages/Results'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import { Toaster } from 'sonner'

// 加载组件
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">加载中...</p>
    </div>
  </div>
)

const App: React.FC = () => {
  return (
    <Router basename="/Adrian">
      <div className="App">
        <Routes>
          {/* 主页 */}
          <Route path="/" element={<Home />} />
          
          {/* 仪表板 */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* 项目管理 */}
          <Route path="/projects/new" element={<CreateProject />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          
          {/* 数据上传 */}
          <Route path="/upload" element={<DataUpload />} />
          
          {/* 分析页面 */}
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/analysis/:id" element={<Analysis />} />
          
          {/* 结果页面 */}
          <Route path="/results" element={<Results />} />
          <Route path="/results/:id" element={<Results />} />
          
          {/* 设置页面 */}
          <Route path="/settings" element={<Settings />} />
          
          {/* 404页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Toast通知 */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App