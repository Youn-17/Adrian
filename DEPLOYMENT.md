# 部署指南

## Vercel 部署步骤

### 1. 登录 Vercel
```bash
npx vercel login
```
选择您的登录方式（GitHub、Google等），并在浏览器中完成登录。

### 2. 部署到生产环境
```bash
npx vercel --prod
```

### 3. 配置环境变量
在 Vercel 控制台中设置以下环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`

## 项目结构优化

项目已经过优化，包括：
- ✅ 创建了 `.vercelignore` 文件排除大文件
- ✅ 配置了 `vercel.json` 用于正确的路由
- ✅ 添加了 `vercel-build` 脚本
- ✅ 项目大小已优化（排除 node_modules 后仅 1.4MB）

## 故障排除

如果遇到部署问题：
1. 确保已登录 Vercel
2. 检查项目大小是否合理
3. 验证 `vercel.json` 配置
4. 确认环境变量设置正确

## 本地测试

部署前可以本地测试：
```bash
npm run build
npm run preview
```