# GitHub + Netlify 部署指南

## 概述

本指南将帮助您将元分析系统部署到 GitHub + Netlify 平台。Netlify 提供了出色的静态网站托管和 Serverless Functions 支持，非常适合全栈应用部署。

## 前置条件

1. 拥有 [GitHub](https://github.com) 账户
2. 拥有 [Netlify](https://netlify.com) 账户（可以用 GitHub 账户登录）
3. 已配置好的 Supabase 项目
4. 本地安装了 Git 和 Node.js

## 部署步骤

### 1. 创建 GitHub 仓库

#### 方法一：通过 GitHub 网站创建

1. 登录 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `meta-analysis-system`
   - Description: `Meta-analysis research system with React frontend and Express backend`
   - 选择 Public 或 Private（推荐 Private）
   - 不要勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

#### 方法二：使用 GitHub CLI（如果已安装）

```bash
gh repo create meta-analysis-system --private --description "Meta-analysis research system"
```

### 2. 推送代码到 GitHub

在项目根目录执行以下命令：

```bash
# 添加远程仓库（替换为您的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/meta-analysis-system.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

### 3. 在 Netlify 部署项目

#### 3.1 连接 GitHub 仓库

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 点击 "New site from Git"
3. 选择 "GitHub" 作为 Git 提供商
4. 授权 Netlify 访问您的 GitHub 账户
5. 选择您刚创建的 `meta-analysis-system` 仓库

#### 3.2 配置构建设置

Netlify 会自动检测到 `netlify.toml` 配置文件，但您也可以手动确认设置：

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

#### 3.3 配置环境变量

在 Netlify 项目设置中添加以下环境变量：

1. 进入 Site settings > Environment variables
2. 添加以下变量：

```
# Supabase 配置
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 前端 Supabase 配置
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT 配置
JWT_SECRET=your_jwt_secret_key_here

# 服务器配置
NODE_ENV=production
PORT=3001

# CORS 配置
CORS_ORIGIN=https://your-site-name.netlify.app

# 文件上传配置
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
```

### 4. 获取 Supabase 配置信息

从 Supabase Dashboard 获取必要的配置信息：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 Settings > API
4. 复制以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: 用于前端
   - **service_role secret key**: 用于后端（谨慎保管）

### 5. 部署和验证

#### 5.1 触发部署

1. 点击 "Deploy site" 开始部署
2. 等待构建完成（通常需要 2-5 分钟）
3. 部署成功后，您会获得一个 Netlify 域名，如：`https://amazing-site-name.netlify.app`

#### 5.2 验证部署

访问以下端点确认部署成功：

- **前端应用**: `https://your-site-name.netlify.app`
- **API 健康检查**: `https://your-site-name.netlify.app/.netlify/functions/api/health`
- **API 端点示例**: `https://your-site-name.netlify.app/.netlify/functions/api/auth/me`

### 6. 配置自定义域名（可选）

1. 在 Netlify 项目设置中点击 "Domain management"
2. 点击 "Add custom domain"
3. 输入您的域名
4. 按照指示配置 DNS 记录
5. 等待 SSL 证书自动配置

## 本地开发

### 环境设置

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/meta-analysis-system.git
cd meta-analysis-system

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入您的配置
nano .env
```

### 启动开发服务器

```bash
# 启动前端和后端开发服务器
npm run dev

# 或者分别启动
npm run client:dev  # 前端 (http://localhost:5173)
npm run server:dev  # 后端 (http://localhost:3001)
```

### 使用 Netlify CLI 本地测试

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录 Netlify
netlify login

# 本地运行 Netlify Functions
netlify dev
```

## 故障排除

### 构建失败

1. **检查依赖**: 确保所有依赖都在 `package.json` 的 `dependencies` 中
2. **TypeScript 错误**: 运行 `npm run check` 检查类型错误
3. **环境变量**: 确认所有必需的环境变量都已设置

### 函数错误

1. **检查日志**: 在 Netlify Dashboard 的 Functions 标签页查看错误日志
2. **本地测试**: 使用 `netlify dev` 在本地测试函数
3. **依赖问题**: 确保 serverless-http 和 @netlify/functions 已正确安装

### API 连接问题

1. **CORS 设置**: 确认 CORS_ORIGIN 环境变量设置正确
2. **Supabase 连接**: 验证 Supabase 配置信息
3. **网络请求**: 检查前端 API 调用是否使用正确的 Netlify Functions 路径

### 常见错误解决

#### 错误："Function not found"
- 确保 `netlify.toml` 配置正确
- 检查函数文件路径是否正确
- 重新部署站点

#### 错误："Environment variable not found"
- 在 Netlify 设置中添加缺失的环境变量
- 重新部署站点使环境变量生效

#### 错误："Build failed"
- 检查 `package.json` 中的构建脚本
- 确保所有依赖都已正确安装
- 查看构建日志获取详细错误信息

## 自动部署

### GitHub 集成

Netlify 自动与 GitHub 集成，实现：

- **自动部署**: 每次推送到 main 分支时自动部署
- **预览部署**: Pull Request 会创建预览部署
- **回滚功能**: 可以轻松回滚到之前的部署版本

### 部署钩子

您可以设置部署钩子来触发自动部署：

1. 在 Netlify 项目设置中找到 "Build hooks"
2. 创建新的构建钩子
3. 使用 webhook URL 触发部署

## 监控和分析

### Netlify Analytics

1. 在项目设置中启用 Netlify Analytics
2. 查看访问统计、性能指标等

### 日志监控

1. **函数日志**: 在 Netlify Dashboard 查看 Functions 日志
2. **构建日志**: 查看每次部署的构建日志
3. **错误追踪**: 集成 Sentry 等错误追踪服务

## 性能优化

### 构建优化

1. **缓存策略**: Netlify 自动处理静态资源缓存
2. **压缩**: 启用 Gzip 压缩
3. **CDN**: Netlify 提供全球 CDN 加速

### 函数优化

1. **冷启动**: 保持函数温暖以减少冷启动时间
2. **内存配置**: 根据需要调整函数内存设置
3. **超时设置**: 合理设置函数超时时间

## 安全最佳实践

1. **环境变量**: 敏感信息只存储在环境变量中
2. **HTTPS**: Netlify 自动提供 SSL 证书
3. **访问控制**: 使用 Netlify 的访问控制功能
4. **安全头**: 在 `netlify.toml` 中配置安全头

## 扩展功能

### 表单处理

Netlify 提供内置表单处理功能，可以处理联系表单等。

### 身份验证

Netlify Identity 可以提供用户身份验证功能，但本项目使用 Supabase Auth。

### 边缘函数

Netlify Edge Functions 提供更快的响应时间，适合简单的 API 端点。

## 成本考虑

- **免费额度**: Netlify 提供慷慨的免费额度
- **函数调用**: 注意 Functions 的调用次数限制
- **带宽**: 监控带宽使用情况
- **构建时间**: 优化构建时间以节省成本

## 支持和社区

- [Netlify 文档](https://docs.netlify.com/)
- [Netlify 社区论坛](https://community.netlify.com/)
- [GitHub Issues](https://github.com/YOUR_USERNAME/meta-analysis-system/issues)

---

## 快速命令参考

```bash
# 本地开发
npm run dev

# 构建项目
npm run build

# 类型检查
npm run check

# 推送到 GitHub
git add .
git commit -m "Your commit message"
git push origin main

# Netlify CLI
netlify dev          # 本地开发
netlify deploy       # 部署到预览
netlify deploy --prod # 部署到生产
```

祝您部署顺利！如有问题，请查看故障排除部分或联系技术支持。