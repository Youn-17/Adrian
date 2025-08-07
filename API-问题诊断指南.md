# API设置问题诊断指南

## 常见问题及解决方案

### 1. 页面无法访问或显示空白

**症状：**
- 访问 `http://localhost:3000/Adrian/settings` 显示空白页面
- 页面加载但API配置部分不显示

**诊断步骤：**
1. 打开浏览器开发者工具（F12）
2. 查看Console标签页是否有错误信息
3. 查看Network标签页是否有请求失败

**解决方案：**
- 确保开发服务器正在运行：`npm run dev`
- 检查路由配置是否正确
- 清除浏览器缓存并刷新页面

### 2. API密钥无法保存

**症状：**
- 输入API密钥后刷新页面丢失
- 保存按钮无响应

**诊断步骤：**
1. 在浏览器控制台运行以下代码检查本地存储：
```javascript
console.log('API Keys:', localStorage.getItem('api_keys'));
```

2. 检查是否有存储权限问题：
```javascript
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('✅ 本地存储正常');
} catch (error) {
  console.log('❌ 本地存储被禁用:', error);
}
```

**解决方案：**
- 确保浏览器允许本地存储
- 检查是否在隐私模式下浏览
- 清除浏览器数据并重试

### 3. API密钥验证失败

**症状：**
- 输入正确的API密钥但验证失败
- 验证按钮一直显示加载状态

**可能原因：**
- CORS（跨域资源共享）问题
- 网络连接问题
- API密钥格式错误
- API服务商限制

**解决方案：**

#### DeepSeek API问题：
- 确保API密钥格式正确（以 `sk-` 开头）
- 检查API密钥是否有效且未过期
- 验证账户余额是否充足

#### Kimi API问题：
- 确保使用正确的API密钥格式
- 检查Moonshot AI账户状态
- 验证API访问权限

#### 网络问题：
- 检查网络连接
- 尝试使用VPN或更换网络
- 检查防火墙设置

### 4. 控制台错误信息

**常见错误及解决方案：**

#### CORS错误：
```
Access to fetch at 'https://api.deepseek.com/v1/models' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**解决方案：** 这是正常的，API验证可能仍然有效。如果持续问题，联系API服务商。

#### 网络错误：
```
Failed to fetch
```
**解决方案：** 检查网络连接，尝试刷新页面。

#### 组件渲染错误：
```
Cannot read properties of undefined
```
**解决方案：** 清除浏览器缓存，重启开发服务器。

## 快速诊断工具

### 在浏览器控制台运行以下代码进行快速诊断：

```javascript
// 1. 检查页面元素
console.log('=== 页面元素检查 ===');
const apiSection = document.querySelector('[data-testid="api-section"], .api-key-manager');
console.log('API配置区域:', apiSection ? '✅ 找到' : '❌ 未找到');

const inputs = document.querySelectorAll('input[type="password"], input[placeholder*="API"]');
console.log('API密钥输入框数量:', inputs.length);

const buttons = document.querySelectorAll('button');
console.log('按钮数量:', buttons.length);

// 2. 检查本地存储
console.log('\n=== 本地存储检查 ===');
const apiKeys = localStorage.getItem('api_keys');
if (apiKeys) {
  try {
    const parsed = JSON.parse(apiKeys);
    console.log('已保存的API密钥:', Object.keys(parsed));
  } catch (error) {
    console.log('❌ API密钥数据损坏');
  }
} else {
  console.log('未找到已保存的API密钥');
}

// 3. 检查React组件
console.log('\n=== React组件检查 ===');
const reactRoot = document.querySelector('#root');
console.log('React根元素:', reactRoot ? '✅ 找到' : '❌ 未找到');

// 4. 测试API密钥保存
console.log('\n=== 测试API密钥保存 ===');
try {
  const testData = { test: { platform: 'test', key: 'test-123' } };
  localStorage.setItem('api_keys_test', JSON.stringify(testData));
  const retrieved = JSON.parse(localStorage.getItem('api_keys_test'));
  localStorage.removeItem('api_keys_test');
  console.log('API密钥保存测试:', retrieved.test.key === 'test-123' ? '✅ 成功' : '❌ 失败');
} catch (error) {
  console.log('❌ API密钥保存测试失败:', error.message);
}
```

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. 浏览器类型和版本
2. 操作系统
3. 控制台错误信息截图
4. 具体的操作步骤
5. 问题出现的时间

## 预防措施

1. **定期备份API密钥配置**
2. **使用最新版本的浏览器**
3. **确保网络连接稳定**
4. **定期检查API密钥有效性**
5. **避免在隐私模式下配置API密钥**

---

*最后更新：2024年1月*