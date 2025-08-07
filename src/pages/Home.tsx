import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Upload, 
  Brain, 
  TrendingUp, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-blue-600" />,
      title: "数据上传",
      description: "支持CSV、Excel和Word文档上传，自动解析Web of Science数据格式"
    },
    {
      icon: <Brain className="h-8 w-8 text-green-600" />,
      title: "AI智能分析",
      description: "集成DeepSeek AI，提供数据质量评估、统计方法推荐和结果解释"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "可视化图表",
      description: "生成森林图、漏斗图等专业元分析图表，支持多种导出格式"
    },
    {
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      title: "学术报告",
      description: "自动生成符合学术标准的元分析报告，包含方法学和结果解释"
    }
  ];

  const steps = [
    { step: "1", title: "创建项目", description: "设置研究主题和参数" },
    { step: "2", title: "上传数据", description: "导入研究数据文件" },
    { step: "3", title: "AI分析", description: "获得智能分析建议" },
    { step: "4", title: "生成报告", description: "导出专业分析结果" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">静态元分析系统</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                开始使用
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            专业的
            <span className="text-blue-600"> 元分析 </span>
            研究平台
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            集成AI智能分析，支持多种数据格式，提供专业的统计分析和可视化功能，
            让您的元分析研究更加高效和准确。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/dashboard" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              立即开始
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/upload" 
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              上传数据
            </Link>
          </div>
        </div>
      </section>

      {/* 功能特性 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">核心功能</h2>
            <p className="text-lg text-gray-600">为元分析研究提供全方位的支持</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">使用流程</h2>
            <p className="text-lg text-gray-600">四步完成专业的元分析</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 优势介绍 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">为什么选择我们？</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">AI智能辅助</h3>
                    <p className="text-gray-600">集成DeepSeek AI，提供专业的分析建议和方法推荐</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">多格式支持</h3>
                    <p className="text-gray-600">支持CSV、Excel、Word等多种数据格式导入</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">专业可视化</h3>
                    <p className="text-gray-600">生成符合学术标准的图表和报告</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">本地存储</h3>
                    <p className="text-gray-600">数据安全存储在本地，保护您的研究隐私</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">提升研究效率</h3>
                <p className="text-gray-600 mb-6">
                  通过AI辅助和自动化工具，将您的元分析研究效率提升10倍
                </p>
                <Link 
                  to="/dashboard" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  开始体验
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-blue-400 mr-3" />
                <h3 className="text-xl font-bold">静态元分析系统</h3>
              </div>
              <p className="text-gray-400">
                专业的元分析研究平台，让学术研究更加高效。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">快速链接</h4>
              <ul className="space-y-2">
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">仪表板</Link></li>
                <li><Link to="/upload" className="text-gray-400 hover:text-white transition-colors">数据上传</Link></li>
                <li><Link to="/analysis" className="text-gray-400 hover:text-white transition-colors">分析工具</Link></li>
                <li><Link to="settings" className="text-gray-400 hover:text-white transition-colors">系统设置</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">技术支持</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">React + TypeScript</li>
                <li className="text-gray-400">DeepSeek AI集成</li>
                <li className="text-gray-400">本地数据存储</li>
                <li className="text-gray-400">GitHub Pages部署</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 静态元分析系统. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;