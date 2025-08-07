# Netlify 环境变量配置指南

## 概述

本文档详细说明如何在 Netlify 中配置元分析系统所需的环境变量。正确配置这些变量对于系统正常运行至关重要。

## 配置步骤

### 1. 访问环境变量设置

1. 登录 [Netlify Dashboard](https://app.netlify.com)
2. 选择您的项目
3. 点击 "Site settings"
4. 在左侧菜单中选择 "Environment variables"
5. 点击 "Add a variable" 开始添加变量

### 2. 必需的环境变量

请按照以下列表添加所有必需的环境变量：

#### Supabase 后端配置

```
变量名: SUPABASE_URL
值: https://vpskwctsseqdjdfoftwi.supabase.co
描述: Supabase 项目 URL
```

```
变量名: SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc2t3Y3Rzc2VxZGpkZm9mdHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDgxODcsImV4cCI6MjA3MDEyNDE4N30.YddY3Im4BqNHgX1KVuKCw8Pn1KpPFuvjAXd3tAJpX_4
描述: Supabase 匿名密钥（用于前端）
```

```
变量名: SUPABASE_SERVICE_ROLE_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc2t3Y3Rzc2VxZGpkZm9mdHdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU0ODE4NywiZXhwIjoyMDcwMTI0MTg3fQ.zWAPsUQH66LmgcTy7lqQazUQAC8rmZKAMxKXfMsj4k8
描述: Supabase 服务角色密钥（仅用于后端）
```

#### Supabase 前端配置

```
变量名: VITE_SUPABASE_URL
值: https://vpskwctsseqdjdfoftwi.supabase.co
描述: 前端 Supabase 项目 URL
```

```
变量名: VITE_SUPABASE_ANON_KEY
值: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc2t3Y3Rzc2VxZGpkZm9mdHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDgxODcsImV4cCI6MjA3MDEyNDE4N30.YddY3Im4BqNHgX1KVuKCw8Pn1KpPFuvjAXd3tAJpX_4
描述: 前端 Supabase 匿名密钥
```

#### JWT 配置

```
变量名: JWT_SECRET
值: your-super-secret-jwt-key-change-this-in-production-2024
描述: JWT 令牌签名密钥
注意: 请生成一个强密码替换此值
```

#### 服务器配置

```
变量名: NODE_ENV
值: production
描述: Node.js 环境模式
```

```
变量名: PORT
值: 3001
描述: 服务器端口
```

#### CORS 配置

```
变量名: CORS_ORIGIN
值: https://your-site-name.netlify.app
描述: 允许的跨域请求来源
注意: 替换为您的实际 Netlify 域名
```

#### 文件上传配置

```
变量名: MAX_FILE_SIZE
值: 52428800
描述: 最大文件上传大小（50MB）
```

```
变量名: UPLOAD_DIR
值: uploads
描述: 文件上传目录
```

### 3. 可选的环境变量

#### 数据库配置（如果使用外部数据库）

```
变量名: DATABASE_URL
值: your-database-connection-string
描述: 数据库连接字符串（可选）
```

### 4. 安全注意事项

#### 🔒 敏感信息保护

- **SERVICE_ROLE_KEY**: 这是最敏感的密钥，具有完全数据库访问权限
- **JWT_SECRET**: 用于签名用户令牌，必须保密
- **永远不要**: 在前端代码中使用 SERVICE_ROLE_KEY

#### 🔑 密钥管理

1. **定期轮换**: 建议定期更换 JWT_SECRET
2. **强密码**: 使用强随机密码作为 JWT_SECRET
3. **访问控制**: 限制对环境变量的访问权限

### 5. 验证配置

#### 5.1 检查环境变量

配置完成后，您可以通过以下方式验证：

1. 在 Netlify Functions 日志中查看是否有环境变量相关错误
2. 访问 API 健康检查端点：`https://your-site.netlify.app/.netlify/functions/api/health`
3. 测试用户注册和登录功能

#### 5.2 常见问题排查

**问题**: "Environment variable not found"
- **解决**: 确保变量名拼写正确，重新部署站点

**问题**: "Supabase connection failed"
- **解决**: 检查 Supabase URL 和密钥是否正确

**问题**: "CORS error"
- **解决**: 确保 CORS_ORIGIN 设置为正确的 Netlify 域名

### 6. 环境变量模板

为了方便复制粘贴，以下是完整的环境变量列表：

```bash
# Supabase 后端配置
SUPABASE_URL=https://vpskwctsseqdjdfoftwi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc2t3Y3Rzc2VxZGpkZm9mdHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDgxODcsImV4cCI6MjA3MDEyNDE4N30.YddY3Im4BqNHgX1KVuKCw8Pn1KpPFuvjAXd3tAJpX_4
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc2t3Y3Rzc2VxZGpkZm9mdHdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDU0ODE4NywiZXhwIjoyMDcwMTI0MTg3fQ.zWAPsUQH66LmgcTy7lqQazUQAC8rmZKAMxKXfMsj4k8

# 前端 Supabase 配置
VITE_SUPABASE_URL=https://vpskwctsseqdjdfoftwi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwc2t3Y3Rzc2VxZGpkZm9mdHdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NDgxODcsImV4cCI6MjA3MDEyNDE4N30.YddY3Im4BqNHgX1KVuKCw8Pn1KpPFuvjAXd3tAJpX_4

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# 服务器配置
NODE_ENV=production
PORT=3001

# CORS 配置
CORS_ORIGIN=https://your-site-name.netlify.app

# 文件上传配置
MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
```

### 7. 部署后步骤

1. **重新部署**: 添加环境变量后，触发重新部署
2. **测试功能**: 验证所有功能是否正常工作
3. **监控日志**: 查看 Functions 日志确保没有错误

### 8. 更新环境变量

如果需要更新环境变量：

1. 在 Netlify Dashboard 中修改变量值
2. 点击 "Save" 保存更改
3. 触发重新部署以应用更改

### 9. 备份和恢复

建议将环境变量配置保存在安全的地方，以便在需要时恢复：

1. 导出当前配置（不包含敏感值）
2. 使用密码管理器存储敏感密钥
3. 定期检查和更新配置

---

**重要提醒**: 请确保所有环境变量都正确配置后再进行部署，错误的配置可能导致应用无法正常运行。