# GitHub Pages 部署指南

## 项目优化完成

✅ **项目文件大小优化**
- 删除了不必要的PRISMA文档文件 (316KB)
- 清理了多余的部署配置文件
- 构建产物大小: 1.6MB (适合GitHub Pages部署)

✅ **构建配置优化**
- 启用Terser压缩
- 配置代码分割
- 移除console和debugger语句
- 优化资源文件命名

## 部署步骤

### 1. 推送代码到GitHub仓库

```bash
cd Adrian_meta_analysis
git add .
git commit -m "优化项目文件大小，配置GitHub Pages部署"
git push origin main
```

### 2. 配置GitHub Secrets

在GitHub仓库设置中添加以下Secrets:

- `VITE_DEEPSEEK_API_KEY`: 你的DeepSeek API密钥
- `VITE_DEEPSEEK_BASE_URL`: DeepSeek API基础URL (可选)

**设置路径**: 仓库 → Settings → Secrets and variables → Actions → New repository secret

### 3. 启用GitHub Pages

1. 进入仓库设置: Settings → Pages
2. Source选择: "GitHub Actions"
3. 等待Actions工作流自动运行

### 4. 访问部署的网站

部署完成后，网站将在以下地址可用:
```
https://youn-17.github.io/Adrian/
```

## 自动部署流程

每次推送到`main`分支时，GitHub Actions会自动:

1. 检出代码
2. 设置Node.js环境
3. 安装依赖
4. 构建项目 (使用环境变量)
5. 部署到GitHub Pages

## 本地测试

在推送前，可以本地测试构建:

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 故障排除

### 构建失败
- 检查GitHub Secrets是否正确设置
- 查看Actions日志获取详细错误信息

### 页面无法访问
- 确认GitHub Pages已启用
- 检查仓库是否为公开状态
- 等待DNS传播 (可能需要几分钟)

### API调用失败
- 验证DeepSeek API密钥是否有效
- 检查API配额是否充足

## 项目特性

- 📊 **静态元分析系统**: 无需服务器，纯前端运行
- 🤖 **AI分析**: 集成DeepSeek API进行智能分析
- 📁 **多格式支持**: CSV、Excel、Word文档解析
- 💾 **本地存储**: 数据保存在浏览器本地
- 📱 **响应式设计**: 支持移动端访问
- 🚀 **快速部署**: GitHub Pages自动部署

---

**注意**: 确保你的GitHub仓库是公开的，或者有GitHub Pro账户以使用私有仓库的GitHub Pages功能。