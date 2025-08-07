# Railway 部署指南

## 前置条件

1. 拥有 [Railway](https://railway.app) 账户
2. 已配置好的 Supabase 项目
3. GitHub 仓库（推荐）

## 部署步骤

### 1. 准备代码仓库

将项目代码推送到 GitHub 仓库：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. 在 Railway 创建项目

1. 登录 [Railway Dashboard](https://railway.app/dashboard)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. Railway 会自动检测到 Node.js 项目并开始部署

### 3. 配置环境变量

在 Railway 项目设置中添加以下环境变量：

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
```

### 4. 获取 Supabase 配置

从 Supabase Dashboard 获取：
- Project URL: `https://your-project.supabase.co`
- API Keys: 在 Settings > API 中找到

### 5. 配置自定义域名（可选）

1. 在 Railway 项目设置中点击 "Domains"
2. 添加自定义域名或使用 Railway 提供的域名

### 6. 部署验证

部署完成后，访问以下端点验证：

- 健康检查: `https://your-app.railway.app/api/health`
- 前端应用: `https://your-app.railway.app`

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入你的配置

# 启动开发服务器
npm run dev
```

## 故障排除

### 构建失败

1. 检查 `package.json` 中的脚本配置
2. 确保所有依赖都在 `dependencies` 中
3. 检查 TypeScript 编译错误

### 运行时错误

1. 检查环境变量配置
2. 查看 Railway 日志
3. 验证 Supabase 连接

### 静态文件问题

1. 确保 `npm run build` 成功
2. 检查 `dist` 目录是否生成
3. 验证静态文件路径配置

## 监控和日志

- Railway Dashboard 提供实时日志
- 可以设置监控和告警
- 支持自动重启和健康检查

## 扩展配置

### 自动部署

Railway 支持 GitHub 集成，每次推送到主分支时自动部署。

### 数据库备份

Supabase 提供自动备份功能，建议启用。

### 性能优化

1. 启用 gzip 压缩
2. 配置 CDN（如果需要）
3. 优化静态资源缓存