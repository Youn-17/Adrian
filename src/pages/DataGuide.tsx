import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Database, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  Info,
  BookOpen,
  Target,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const DataGuide: React.FC = () => {
  const requiredFields = [
    {
      field: 'title',
      description: '研究标题',
      aliases: ['标题', 'Title', 'Study Title', 'Paper Title', '论文标题'],
      example: 'Effects of Exercise on Mental Health'
    },
    {
      field: 'author',
      description: '作者',
      aliases: ['作者', 'Author', 'Authors', 'First Author', '第一作者'],
      example: 'Smith, J.'
    },
    {
      field: 'year',
      description: '发表年份',
      aliases: ['年份', 'Year', 'Publication Year', '发表年份', '出版年'],
      example: '2023'
    },
    {
      field: 'sampleSize',
      description: '样本量',
      aliases: ['样本量', 'Sample Size', 'N', 'n', 'Participants', '参与者数量'],
      example: '120'
    },
    {
      field: 'effectSize',
      description: '效应量',
      aliases: ['效应量', 'Effect Size', 'Cohen\'s d', 'd', 'r', 'OR', 'RR'],
      example: '0.65'
    },
    {
      field: 'standardError',
      description: '标准误',
      aliases: ['标准误', 'Standard Error', 'SE', 'Std Error', '标准错误'],
      example: '0.12'
    }
  ];

  const optionalFields = [
    {
      field: 'journal',
      description: '期刊名称',
      aliases: ['期刊', 'Journal', 'Publication', '出版物'],
      example: 'Journal of Health Psychology'
    },
    {
      field: 'doi',
      description: 'DOI',
      aliases: ['DOI', 'Digital Object Identifier'],
      example: '10.1177/1359105320123456'
    },
    {
      field: 'country',
      description: '研究国家/地区',
      aliases: ['国家', 'Country', 'Region', '地区'],
      example: 'USA'
    },
    {
      field: 'intervention',
      description: '干预措施',
      aliases: ['干预', 'Intervention', 'Treatment', '治疗'],
      example: 'Aerobic Exercise'
    },
    {
      field: 'outcome',
      description: '结果指标',
      aliases: ['结果', 'Outcome', 'Measure', '测量指标'],
      example: 'Depression Score'
    }
  ];

  const csvExample = `title,author,year,sampleSize,effectSize,standardError,journal
"Effects of Exercise on Mental Health","Smith, J.",2023,120,0.65,0.12,"Journal of Health Psychology"
"Mindfulness and Anxiety Reduction","Johnson, M.",2022,85,0.48,0.15,"Clinical Psychology Review"
"Cognitive Therapy Effectiveness","Brown, K.",2023,200,0.72,0.10,"Psychological Medicine"`;

  const excelExample = [
    ['标题', '作者', '年份', '样本量', '效应量', '标准误', '期刊'],
    ['运动对心理健康的影响', '张三', '2023', '120', '0.65', '0.12', '心理学报'],
    ['正念减压干预研究', '李四', '2022', '85', '0.48', '0.15', '临床心理学评论'],
    ['认知疗法有效性分析', '王五', '2023', '200', '0.72', '0.10', '心理医学']
  ];

  const qualityRequirements = [
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: '数据完整性',
      description: '确保必需字段都有数据，避免空值'
    },
    {
      icon: <Target className="h-5 w-5 text-blue-600" />,
      title: '数据一致性',
      description: '同一字段的数据格式保持一致（如年份格式、效应量小数位数）'
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      title: '样本量合理性',
      description: '样本量应为正整数，符合研究实际情况'
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      title: '效应量有效性',
      description: '效应量应为数值，标准误应为正数'
    }
  ];

  const txtExample = `title\tauthor\tyear\tsampleSize\teffectSize\tstandardError\tjournal
Effects of Exercise on Mental Health\tSmith, J.\t2023\t120\t0.65\t0.12\tJournal of Health Psychology
Mindfulness and Anxiety Reduction\tJohnson, M.\t2022\t85\t0.48\t0.15\tClinical Psychology Review
Cognitive Therapy Effectiveness\tBrown, K.\t2023\t200\t0.72\t0.10\tPsychological Medicine`;

  const txtCsvExample = `title,author,year,sampleSize,effectSize,standardError,journal
"Effects of Exercise on Mental Health","Smith, J.",2023,120,0.65,0.12,"Journal of Health Psychology"
"Mindfulness and Anxiety Reduction","Johnson, M.",2022,85,0.48,0.15,"Clinical Psychology Review"
"Cognitive Therapy Effectiveness","Brown, K.",2023,200,0.72,0.10,"Psychological Medicine"`;

  const faqs = [
    {
      question: '如果我的数据列名不是英文怎么办？',
      answer: '系统支持中英文列名自动识别。您可以使用中文列名如"标题"、"作者"等，系统会自动匹配到对应的字段。'
    },
    {
      question: '可以上传多个文件吗？',
      answer: '可以。系统支持同时上传多个文件，会自动合并处理。建议每个文件包含同类型的研究数据。'
    },
    {
      question: '如果某些必需字段缺失怎么办？',
      answer: '系统会提示缺失的字段。您可以在数据预处理阶段补充这些信息，或者排除不完整的记录。'
    },
    {
      question: '支持哪些效应量类型？',
      answer: '支持Cohen\'s d、相关系数r、比值比OR、风险比RR等常见效应量。系统会根据数据自动识别类型。'
    },
    {
      question: 'TXT文件应该如何格式化？',
      answer: 'TXT文件支持制表符分隔（TSV）和逗号分隔（CSV）两种格式。第一行必须包含列标题，后续行为数据记录。确保使用UTF-8编码以支持中文字符。'
    },
    {
      question: '数据预处理包括哪些功能？',
      answer: '系统提供自动数据清理、缺失值处理、异常值检测、数据类型转换、字段映射等预处理功能，确保数据质量符合Meta分析要求。'
    },
    {
      question: '如何处理不同研究的效应量类型不一致？',
      answer: '系统会自动识别效应量类型，并在必要时进行标准化转换。例如，将相关系数r转换为Fisher\'s Z，或将比值比转换为对数比值比。'
    },
    {
      question: '系统如何识别数据结构？',
      answer: '系统使用AI技术自动分析上传文件的结构，识别列类型、数据分布、缺失模式等，并提供相应的处理建议和自动化处理选项。'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/upload" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                返回上传
              </Link>
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">数据准备指南</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/upload" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                开始上传
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 概览 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-4">Meta分析数据准备指南</h2>
          <p className="text-xl opacity-90 mb-6">
            本指南将帮助您准备符合Meta分析要求的数据文件，确保分析的准确性和可靠性。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <FileText className="h-8 w-8 mb-2" />
              <h3 className="font-semibold mb-1">支持多种格式</h3>
              <p className="text-sm opacity-80">CSV、Excel、Word、TXT</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <Database className="h-8 w-8 mb-2" />
              <h3 className="font-semibold mb-1">智能字段识别</h3>
              <p className="text-sm opacity-80">自动匹配中英文列名</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <BarChart3 className="h-8 w-8 mb-2" />
              <h3 className="font-semibold mb-1">专业分析</h3>
              <p className="text-sm opacity-80">完整的Meta分析流程</p>
            </div>
          </div>
        </div>

        {/* 支持的文件格式 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">支持的文件格式</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <Database className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">CSV文件</h3>
              <p className="text-sm text-gray-600 mb-2">逗号分隔值文件，最常用的数据交换格式</p>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">.csv</span>
            </div>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <FileText className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Excel文件</h3>
              <p className="text-sm text-gray-600 mb-2">Microsoft Excel工作簿文件</p>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-1">.xlsx</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">.xls</span>
            </div>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <FileText className="h-8 w-8 text-orange-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Word文档</h3>
              <p className="text-sm text-gray-600 mb-2">Microsoft Word文档，支持表格提取</p>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">.docx</span>
            </div>
            <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <FileText className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">文本文件</h3>
              <p className="text-sm text-gray-600 mb-2">纯文本格式，支持制表符或逗号分隔</p>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">.txt</span>
            </div>
          </div>
        </div>

        {/* 必需字段 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">必需数据字段</h2>
          <div className="space-y-4">
            {requiredFields.map((field, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{field.description}</h3>
                  <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">必需</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>支持的列名：</strong> {field.aliases.join('、')}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>示例：</strong> {field.example}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 可选字段 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">可选数据字段</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionalFields.map((field, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{field.description}</h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">可选</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>支持的列名：</strong> {field.aliases.join('、')}
                </p>
                <p className="text-sm text-gray-500">
                  <strong>示例：</strong> {field.example}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 数据格式示例 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">数据格式示例</h2>
          
          {/* CSV示例 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-5 w-5 text-blue-600 mr-2" />
              CSV格式示例
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{csvExample}</pre>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <Download className="h-4 w-4 mr-1" />
              <button className="text-blue-600 hover:text-blue-700">下载CSV模板</button>
            </div>
          </div>

          {/* Excel示例 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              Excel格式示例
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <tbody>
                  {excelExample.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-100' : 'bg-white'}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border border-gray-300 px-3 py-2 text-sm">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <Download className="h-4 w-4 mr-1" />
              <button className="text-blue-600 hover:text-blue-700">下载Excel模板</button>
            </div>
          </div>

          {/* TXT文件示例 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-purple-600 mr-2" />
              TXT文件格式示例
            </h3>
            
            {/* 制表符分隔格式 */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-2">制表符分隔格式（TSV）</h4>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{txtExample}</pre>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>说明：</strong> 使用制表符（Tab键）分隔各列数据，适合包含逗号的文本内容。
              </p>
            </div>
            
            {/* 逗号分隔格式 */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-800 mb-2">逗号分隔格式（CSV格式的TXT）</h4>
              <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">{txtCsvExample}</pre>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <strong>说明：</strong> 使用逗号分隔各列数据，包含逗号的文本需要用双引号包围。
              </p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">TXT文件注意事项</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 文件编码必须为UTF-8，以正确显示中文字符</li>
                <li>• 第一行必须包含列标题</li>
                <li>• 数值字段不要包含千位分隔符</li>
                <li>• 避免在数据中使用分隔符字符（制表符或逗号）</li>
                <li>• 如果文本包含换行符，请用双引号包围整个文本</li>
              </ul>
            </div>
            
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <Download className="h-4 w-4 mr-1" />
              <button className="text-blue-600 hover:text-blue-700 mr-4">下载TSV模板</button>
              <button className="text-blue-600 hover:text-blue-700">下载CSV格式TXT模板</button>
            </div>
          </div>

          {/* 数据预处理功能介绍 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
              智能数据预处理功能
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">自动数据识别</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• 智能识别列类型（数值、文本、日期）</li>
                  <li>• 自动匹配中英文字段名</li>
                  <li>• 检测数据分布和统计特征</li>
                  <li>• 识别效应量类型和统计方法</li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-3">数据质量检查</h4>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• 缺失值检测和处理建议</li>
                  <li>• 异常值识别和验证</li>
                  <li>• 数据一致性检查</li>
                  <li>• 重复记录检测</li>
                </ul>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-3">自动数据转换</h4>
                <ul className="text-sm text-purple-800 space-y-2">
                  <li>• 效应量标准化转换</li>
                  <li>• 置信区间计算</li>
                  <li>• 标准误估算</li>
                  <li>• 数据格式统一</li>
                </ul>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-3">Meta分析准备</h4>
                <ul className="text-sm text-orange-800 space-y-2">
                  <li>• 研究权重计算</li>
                  <li>• 异质性初步评估</li>
                  <li>• 亚组变量识别</li>
                  <li>• 分析方法推荐</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 数据质量要求 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">数据质量要求</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {qualityRequirements.map((req, index) => (
              <div key={index} className="flex items-start space-x-3">
                {req.icon}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{req.title}</h3>
                  <p className="text-sm text-gray-600">{req.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 常见问题 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Info className="h-5 w-5 text-blue-600 mr-2" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 ml-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 行动按钮 */}
        <div className="mt-8 text-center">
          <Link 
            to="/upload" 
            className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
          >
            开始上传数据
            <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DataGuide;