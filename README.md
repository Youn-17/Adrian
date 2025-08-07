# 静态元分析系统

一个基于React和TypeScript的静态元分析系统，集成DeepSeek AI进行智能分析和解读。

## 功能特性

- 📊 **数据上传与处理**：支持CSV、Excel、Word文档格式
- 🤖 **AI智能分析**：集成DeepSeek API进行数据质量评估和结果解读
- 📈 **可视化图表**：森林图、漏斗图等专业图表展示
- 💾 **本地存储**：无需数据库，数据安全存储在浏览器本地
- 🌐 **静态部署**：支持GitHub Pages等静态托管平台
- 🎨 **现代界面**：基于Tailwind CSS的响应式设计

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **图表库**：Recharts
- **AI集成**：DeepSeek API
- **状态管理**：Zustand
- **文件处理**：Papa Parse (CSV)、SheetJS (Excel)、Mammoth (Word)

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置DeepSeek API密钥：
```env
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
VITE_DEEPSEEK_BASE_URL=https://api.deepseek.com
```

### 开发运行

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 构建部署

```bash
npm run build
```

构建文件将生成在 `dist` 目录中。

## GitHub Pages 部署

### 自动部署

1. 在GitHub仓库中设置Secrets：
   - `VITE_DEEPSEEK_API_KEY`：你的DeepSeek API密钥
   - `VITE_DEEPSEEK_BASE_URL`：DeepSeek API基础URL

2. 推送代码到main分支，GitHub Actions将自动构建和部署

3. 在仓库设置中启用GitHub Pages，选择gh-pages分支

### 手动部署

```bash
# 构建项目
npm run build

# 部署到GitHub Pages
npm run deploy
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   ├── charts/         # 图表组件
│   └── layout/         # 布局组件
├── pages/              # 页面组件
├── hooks/              # 自定义Hooks
├── services/           # API服务
├── utils/              # 工具函数
├── types/              # TypeScript类型定义
└── contexts/           # React Context
```

## 使用指南

### 1. 数据上传

- 支持CSV、Excel (.xlsx, .xls)、Word (.docx) 格式
- 系统会自动解析文件内容并提取研究数据
- 支持批量上传多个文件

### 2. 数据管理

- 查看已上传的数据集
- 预览数据内容和统计信息
- 删除不需要的数据集

### 3. 元分析

- 选择要分析的数据集
- 配置分析参数（置信水平、统计模型等）
- 启动AI辅助分析
- 查看分析结果和AI解读

### 4. 结果可视化

- 森林图：展示各研究效应量和总体效应
- 漏斗图：检测发表偏倚
- 异质性分析图表

## API配置

### DeepSeek API

本系统使用DeepSeek API进行AI分析。需要：

1. 注册DeepSeek账号
2. 获取API密钥
3. 在环境变量中配置密钥

### 环境变量说明

- `VITE_DEEPSEEK_API_KEY`：DeepSeek API密钥
- `VITE_DEEPSEEK_BASE_URL`：API基础URL
- `VITE_APP_TITLE`：应用标题
- `VITE_BASE_URL`：部署基础路径（GitHub Pages需要）

## 开发指南

### 代码规范

- 使用TypeScript进行类型检查
- 遵循ESLint规则
- 使用Prettier格式化代码

### 测试

```bash
# 运行类型检查
npm run check

# 运行构建测试
npm run build
```

### 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 支持

如有问题或建议，请创建Issue或联系开发团队。
