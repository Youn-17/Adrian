# 部署验证清单

## GitHub + Netlify 部署验证步骤

### ✅ 部署前检查

- [ ] **代码已推送到 GitHub**
  - 确认所有文件已提交到 Git 仓库
  - 验证 GitHub 仓库包含最新代码
  - 检查 `.gitignore` 文件是否正确排除敏感文件

- [ ] **配置文件完整**
  - `netlify.toml` 文件存在且配置正确
  - `package.json` 包含所有必需依赖
  - `netlify/functions/api.ts` 函数文件存在

- [ ] **环境变量准备**
  - Supabase 项目 URL 和密钥已获取
  - JWT 密钥已生成
  - 所有环境变量已记录

### 🚀 Netlify 部署步骤

- [ ] **连接 GitHub 仓库**
  - 在 Netlify 中选择正确的 GitHub 仓库
  - 确认构建设置：
    - Build command: `npm run build`
    - Publish directory: `dist`
    - Functions directory: `netlify/functions`

- [ ] **配置环境变量**
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=3001`
  - [ ] `CORS_ORIGIN` (设置为 Netlify 域名)
  - [ ] `MAX_FILE_SIZE=52428800`
  - [ ] `UPLOAD_DIR=uploads`

- [ ] **触发首次部署**
  - 点击 "Deploy site" 开始部署
  - 等待构建完成（通常 2-5 分钟）
  - 检查构建日志是否有错误

### 🔍 部署后验证

#### 基础功能测试

- [ ] **网站可访问**
  - 访问 Netlify 提供的域名
  - 确认首页正常加载
  - 检查页面样式是否正确

- [ ] **API 端点测试**
  - [ ] 健康检查：`https://your-site.netlify.app/.netlify/functions/api/health`
    - 应返回：`{"status": "ok", "timestamp": "...", "environment": "production"}`
  - [ ] 认证端点：`https://your-site.netlify.app/.netlify/functions/api/auth/me`
    - 未登录时应返回 401 错误

#### 前端功能测试

- [ ] **页面导航**
  - [ ] 首页加载正常
  - [ ] 登录页面可访问
  - [ ] 注册页面可访问
  - [ ] 仪表板页面（需要登录）

- [ ] **用户认证**
  - [ ] 用户注册功能
  - [ ] 用户登录功能
  - [ ] 用户登出功能
  - [ ] 受保护路由重定向

#### 后端功能测试

- [ ] **数据库连接**
  - [ ] Supabase 连接正常
  - [ ] 用户表操作正常
  - [ ] 项目表操作正常

- [ ] **API 路由**
  - [ ] `/api/auth/*` - 认证相关
  - [ ] `/api/projects/*` - 项目管理
  - [ ] `/api/papers/*` - 论文管理
  - [ ] `/api/upload/*` - 文件上传
  - [ ] `/api/analysis/*` - 分析功能

#### 文件上传测试

- [ ] **上传功能**
  - [ ] 文件选择界面正常
  - [ ] 文件上传进度显示
  - [ ] 上传成功后的反馈
  - [ ] 文件大小限制生效

### 🐛 常见问题排查

#### 构建失败

- [ ] **检查构建日志**
  - 查看 Netlify 构建日志中的错误信息
  - 确认所有依赖都已正确安装

- [ ] **TypeScript 错误**
  - 运行 `npm run check` 检查类型错误
  - 修复所有 TypeScript 编译错误

- [ ] **依赖问题**
  - 确认 `package.json` 中的依赖版本
  - 检查是否有缺失的依赖

#### 运行时错误

- [ ] **环境变量问题**
  - 确认所有环境变量都已设置
  - 检查变量名是否拼写正确
  - 验证变量值是否正确

- [ ] **CORS 错误**
  - 确认 `CORS_ORIGIN` 设置为正确的域名
  - 检查前端请求的 URL 是否正确

- [ ] **Supabase 连接问题**
  - 验证 Supabase URL 和密钥
  - 检查 Supabase 项目是否正常运行
  - 确认数据库表是否已创建

#### 函数错误

- [ ] **Netlify Functions 问题**
  - 检查函数日志中的错误信息
  - 确认函数文件路径正确
  - 验证 serverless-http 配置

### 📊 性能验证

- [ ] **加载速度**
  - 首页加载时间 < 3 秒
  - API 响应时间 < 2 秒
  - 静态资源缓存正常

- [ ] **移动端适配**
  - 在移动设备上测试界面
  - 确认响应式设计正常
  - 触摸操作正常

### 🔒 安全验证

- [ ] **HTTPS 配置**
  - 网站强制使用 HTTPS
  - SSL 证书有效
  - 安全头配置正确

- [ ] **敏感信息保护**
  - 环境变量未暴露在前端
  - API 密钥安全存储
  - 用户数据加密传输

### 📝 文档验证

- [ ] **部署文档**
  - `GITHUB_NETLIFY_DEPLOYMENT.md` 完整
  - `NETLIFY_ENV_SETUP.md` 详细
  - `README.md` 更新

- [ ] **API 文档**
  - API 端点文档完整
  - 请求/响应示例清晰
  - 错误代码说明

### 🎯 最终验证

- [ ] **完整用户流程**
  1. [ ] 访问网站首页
  2. [ ] 注册新用户账户
  3. [ ] 登录系统
  4. [ ] 创建新项目
  5. [ ] 上传论文文件
  6. [ ] 进行数据分析
  7. [ ] 查看分析结果
  8. [ ] 登出系统

- [ ] **多浏览器测试**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] **设备兼容性**
  - [ ] 桌面端
  - [ ] 平板端
  - [ ] 移动端

### 📈 监控设置

- [ ] **Netlify Analytics**
  - 启用网站分析
  - 配置性能监控
  - 设置错误告警

- [ ] **日志监控**
  - 检查函数日志
  - 监控错误频率
  - 设置日志告警

### ✅ 部署完成确认

当所有上述项目都已检查并通过时，您的 GitHub + Netlify 部署就完成了！

**最终检查清单：**

- [ ] 网站在生产环境正常运行
- [ ] 所有核心功能都已测试通过
- [ ] 性能指标符合预期
- [ ] 安全配置正确
- [ ] 文档完整且准确
- [ ] 监控和告警已设置

---

## 部署后维护

### 定期检查

- **每周**：检查网站运行状态和性能指标
- **每月**：更新依赖包和安全补丁
- **每季度**：审查和更新环境变量

### 备份策略

- 定期备份 Supabase 数据库
- 保存环境变量配置
- 维护代码仓库的备份

### 更新流程

1. 在本地开发和测试新功能
2. 推送代码到 GitHub
3. Netlify 自动部署
4. 验证部署结果
5. 监控生产环境

恭喜！您已成功完成 GitHub + Netlify 部署！🎉