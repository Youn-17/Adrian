import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Upload,
  BarChart3,
  Settings,
  Brain,
  Database,
  CheckCircle,
  AlertCircle,
  Info,
  Play,
  Download,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface GuideSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
}

const Help: React.FC = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqData: FAQItem[] = [
    {
      question: '什么是Meta分析？',
      answer: 'Meta分析是一种统计方法，用于系统性地整合多个独立研究的结果，以获得更可靠和精确的结论。它通过定量合并研究结果，提供比单个研究更强的统计效力。',
      category: 'basic'
    },
    {
      question: '支持哪些数据格式？',
      answer: '系统支持CSV、Excel（.xlsx, .xls）、Word文档（.docx）和TXT文本文件。建议使用CSV格式以获得最佳兼容性。',
      category: 'data'
    },
    {
      question: '如何准备数据？',
      answer: '数据应包含研究名称、效应量、标准误、样本量等必要字段。每行代表一个研究，确保数据格式一致且无缺失值。详细要求请参考数据准备指南。',
      category: 'data'
    },
    {
      question: 'AI分析功能如何使用？',
      answer: '首先在设置中配置AI API密钥，然后在分析页面选择数据集，系统会自动进行数据质量评估、方法推荐和结果解读。',
      category: 'analysis'
    },
    {
      question: '如何解读分析结果？',
      answer: '关注总体效应量、置信区间、异质性检验（I²统计量）、发表偏倚检验等指标。AI会提供专业的结果解读和临床意义说明。',
      category: 'analysis'
    },
    {
      question: '数据安全如何保障？',
      answer: '所有数据存储在本地浏览器中，不会上传到服务器。您可以随时导出或清除数据。API调用仅用于AI分析，不会存储您的研究数据。',
      category: 'security'
    }
  ];

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: '快速开始',
      icon: Play,
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">欢迎使用Meta分析系统</h3>
            <p className="text-blue-800 mb-4">
              本系统为研究人员提供完整的Meta分析工作流程，从数据上传到结果解读，全程AI辅助。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🎯 适用场景</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 医学研究Meta分析</li>
                  <li>• 教育效果评估</li>
                  <li>• 心理学干预研究</li>
                  <li>• 社会科学研究综述</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">✨ 核心优势</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• AI智能分析与解读</li>
                  <li>• 自动数据质量检查</li>
                  <li>• 专业统计方法推荐</li>
                  <li>• 可视化结果展示</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本工作流程</h3>
            <div className="space-y-4">
              {[
                { step: 1, title: '数据准备', desc: '按照标准格式整理研究数据', icon: FileText },
                { step: 2, title: '数据上传', desc: '上传CSV、Excel或Word文档', icon: Upload },
                { step: 3, title: '数据预处理', desc: '系统自动检查和清理数据', icon: Settings },
                { step: 4, title: 'AI分析', desc: '智能分析并生成结果', icon: Brain },
                { step: 5, title: '结果解读', desc: '查看可视化结果和AI解读', icon: BarChart3 }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {item.step}
                    </div>
                    <Icon className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-preparation',
      title: '数据准备',
      icon: Database,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">数据格式要求</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">必需字段</h4>
                <div className="space-y-2">
                  {[
                    { field: 'study_name', desc: '研究名称或标识符' },
                    { field: 'effect_size', desc: '效应量（如Cohen\'s d, OR, RR等）' },
                    { field: 'standard_error', desc: '标准误' },
                    { field: 'sample_size', desc: '样本量' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.field}</code>
                        <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">可选字段</h4>
                <div className="space-y-2">
                  {[
                    { field: 'confidence_interval_lower', desc: '置信区间下限' },
                    { field: 'confidence_interval_upper', desc: '置信区间上限' },
                    { field: 'p_value', desc: 'P值' },
                    { field: 'study_quality', desc: '研究质量评分' },
                    { field: 'subgroup', desc: '亚组分类变量' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{item.field}</code>
                        <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">数据示例</h3>
            <div className="bg-white rounded-lg p-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-900">study_name</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900">effect_size</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900">standard_error</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900">sample_size</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900">subgroup</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">Smith et al. 2020</td>
                    <td className="py-2 px-3 text-gray-700">0.45</td>
                    <td className="py-2 px-3 text-gray-700">0.12</td>
                    <td className="py-2 px-3 text-gray-700">120</td>
                    <td className="py-2 px-3 text-gray-700">高质量</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-2 px-3 text-gray-700">Johnson et al. 2021</td>
                    <td className="py-2 px-3 text-gray-700">0.32</td>
                    <td className="py-2 px-3 text-gray-700">0.15</td>
                    <td className="py-2 px-3 text-gray-700">95</td>
                    <td className="py-2 px-3 text-gray-700">中等质量</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-gray-700">Brown et al. 2022</td>
                    <td className="py-2 px-3 text-gray-700">0.58</td>
                    <td className="py-2 px-3 text-gray-700">0.18</td>
                    <td className="py-2 px-3 text-gray-700">80</td>
                    <td className="py-2 px-3 text-gray-700">高质量</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'analysis-guide',
      title: '分析指南',
      icon: BarChart3,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">分析步骤详解</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  1. 数据质量评估
                </h4>
                <p className="text-gray-600 mb-3">
                  AI会自动检查数据完整性、一致性和质量，识别潜在问题并提供改进建议。
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-2">评估内容包括：</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 缺失值检测与处理建议</li>
                    <li>• 异常值识别与验证</li>
                    <li>• 数据分布特征分析</li>
                    <li>• 研究间异质性初步评估</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  2. 统计方法推荐
                </h4>
                <p className="text-gray-600 mb-3">
                  基于数据特征和研究类型，AI会推荐最适合的统计方法和参数设置。
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-2">推荐内容包括：</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 效应量模型选择（固定效应 vs 随机效应）</li>
                    <li>• 异质性检验方法</li>
                    <li>• 发表偏倚检测方法</li>
                    <li>• 亚组分析策略</li>
                    <li>• 敏感性分析方案</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                  3. 结果解读
                </h4>
                <p className="text-gray-600 mb-3">
                  AI提供专业的结果解读，包括统计学意义、临床意义和实践建议。
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-2">解读内容包括：</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 总体效应量的临床意义</li>
                    <li>• 异质性来源分析</li>
                    <li>• 发表偏倚影响评估</li>
                    <li>• 证据质量等级评定</li>
                    <li>• 研究局限性与未来方向</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ai-features',
      title: 'AI功能',
      icon: Brain,
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">AI辅助分析功能</h3>
            <p className="text-blue-800 mb-6">
              本系统集成了先进的AI技术，为Meta分析提供智能化支持，提高分析效率和结果可靠性。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  智能数据检查
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 自动识别数据结构和字段类型</li>
                  <li>• 检测缺失值和异常值</li>
                  <li>• 评估数据质量和完整性</li>
                  <li>• 提供数据清理建议</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Brain className="h-5 w-5 text-blue-600 mr-2" />
                  方法智能推荐
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 基于数据特征推荐统计方法</li>
                  <li>• 自动选择合适的效应量模型</li>
                  <li>• 推荐异质性检验策略</li>
                  <li>• 建议亚组分析方案</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
                  结果智能解读
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 自动生成结果摘要</li>
                  <li>• 解释统计学和临床意义</li>
                  <li>• 评估证据质量等级</li>
                  <li>• 识别研究局限性</li>
                </ul>
              </div>
              
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="h-5 w-5 text-orange-600 mr-2" />
                  报告自动生成
                </h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• 生成标准化分析报告</li>
                  <li>• 提供学术写作建议</li>
                  <li>• 自动引用相关文献</li>
                  <li>• 导出多种格式报告</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-4">AI配置说明</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">API密钥配置</h4>
                <p className="text-sm text-gray-600 mb-3">
                  在设置页面配置AI平台的API密钥，目前支持DeepSeek等主流AI服务。
                </p>
                <Link 
                  to="/settings" 
                  className="inline-flex items-center text-sm bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  前往配置
                </Link>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">使用建议</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 确保网络连接稳定，AI分析需要在线调用</li>
                  <li>• 数据量较大时，AI分析可能需要更长时间</li>
                  <li>• AI建议仅供参考，最终决策需结合专业判断</li>
                  <li>• 定期更新API密钥以确保服务可用性</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: '故障排除',
      icon: AlertCircle,
      content: (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">常见问题解决</h3>
            <div className="space-y-6">
              {[
                {
                  problem: '数据上传失败',
                  solutions: [
                    '检查文件格式是否支持（CSV、Excel、Word、TXT）',
                    '确认文件大小不超过限制（建议小于10MB）',
                    '检查文件是否损坏或被加密',
                    '尝试使用CSV格式重新上传'
                  ]
                },
                {
                  problem: 'AI分析无响应',
                  solutions: [
                    '检查API密钥是否正确配置',
                    '确认网络连接正常',
                    '检查API服务是否可用',
                    '尝试刷新页面重新分析'
                  ]
                },
                {
                  problem: '分析结果异常',
                  solutions: [
                    '检查数据格式和字段名称是否正确',
                    '确认效应量和标准误数值合理',
                    '检查是否存在极端异常值',
                    '验证样本量数据的准确性'
                  ]
                },
                {
                  problem: '页面加载缓慢',
                  solutions: [
                    '清除浏览器缓存和Cookie',
                    '检查网络连接速度',
                    '尝试使用其他浏览器',
                    '关闭不必要的浏览器标签页'
                  ]
                }
              ].map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-700 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {item.problem}
                  </h4>
                  <div className="space-y-2">
                    {item.solutions.map((solution, sIndex) => (
                      <div key={sIndex} className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-sm text-gray-600">{solution}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">获取更多帮助</h3>
            <p className="text-blue-800 mb-4">
              如果以上解决方案无法解决您的问题，请尝试以下方式获取帮助：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">📚 查看文档</h4>
                <p className="text-sm text-gray-600 mb-3">
                  访问完整的用户手册和API文档
                </p>
                <Link 
                  to="/data-guide" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  数据准备指南 →
                </Link>
              </div>
              <div className="bg-white rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">🔧 系统设置</h4>
                <p className="text-sm text-gray-600 mb-3">
                  检查和调整系统配置
                </p>
                <Link 
                  to="/settings" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  前往设置 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredFAQ = faqData.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sidebarSections = [
    { id: 'getting-started', title: '快速开始', icon: Play },
    { id: 'data-preparation', title: '数据准备', icon: Database },
    { id: 'analysis-guide', title: '分析指南', icon: BarChart3 },
    { id: 'ai-features', title: 'AI功能', icon: Brain },
    { id: 'troubleshooting', title: '故障排除', icon: AlertCircle }
  ];

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
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">帮助中心</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏 */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-4">帮助主题</h2>
              <nav className="space-y-2">
                {sidebarSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            {/* 当前选中的指南内容 */}
            <div className="mb-8">
              {guideSections.find(section => section.id === activeSection)?.content}
            </div>

            {/* FAQ部分 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">常见问题</h2>
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="搜索问题..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredFAQ.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900">{item.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 pb-4 border-t border-gray-200">
                        <p className="text-gray-600 pt-3">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">未找到相关问题，请尝试其他关键词</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;