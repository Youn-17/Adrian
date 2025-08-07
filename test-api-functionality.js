// API密钥功能测试脚本
// 在浏览器控制台中运行此脚本来测试API密钥功能

console.log('=== API密钥功能测试 ===');

// 测试1: 检查本地存储
console.log('\n1. 检查本地存储中的API密钥:');
const savedKeys = localStorage.getItem('api_keys');
if (savedKeys) {
  try {
    const parsed = JSON.parse(savedKeys);
    console.log('已保存的API密钥:', parsed);
    console.log('密钥数量:', Object.keys(parsed).length);
  } catch (error) {
    console.error('解析API密钥失败:', error);
  }
} else {
  console.log('未找到已保存的API密钥');
}

// 测试2: 保存测试密钥
console.log('\n2. 保存测试密钥:');
const testKey = {
  platform: 'test',
  key: 'test-key-123',
  isValid: false,
  lastValidated: new Date().toISOString()
};

try {
  const currentKeys = savedKeys ? JSON.parse(savedKeys) : {};
  currentKeys['test'] = testKey;
  localStorage.setItem('api_keys', JSON.stringify(currentKeys));
  console.log('测试密钥保存成功');
} catch (error) {
  console.error('保存测试密钥失败:', error);
}

// 测试3: 验证保存
console.log('\n3. 验证保存结果:');
const updatedKeys = localStorage.getItem('api_keys');
if (updatedKeys) {
  try {
    const parsed = JSON.parse(updatedKeys);
    console.log('更新后的API密钥:', parsed);
    if (parsed['test']) {
      console.log('✅ 测试密钥保存成功');
    } else {
      console.log('❌ 测试密钥保存失败');
    }
  } catch (error) {
    console.error('验证失败:', error);
  }
}

// 测试4: 清理测试数据
console.log('\n4. 清理测试数据:');
try {
  const currentKeys = JSON.parse(localStorage.getItem('api_keys') || '{}');
  delete currentKeys['test'];
  localStorage.setItem('api_keys', JSON.stringify(currentKeys));
  console.log('✅ 测试数据清理完成');
} catch (error) {
  console.error('清理失败:', error);
}

// 测试5: 检查页面元素
console.log('\n5. 检查页面元素:');
const apiKeyInputs = document.querySelectorAll('input[type="password"], input[placeholder*="API"]');
console.log('找到API密钥输入框数量:', apiKeyInputs.length);

const validateButtons = document.querySelectorAll('button[class*="validate"], button:contains("验证")');
console.log('找到验证按钮数量:', validateButtons.length);

const platformButtons = document.querySelectorAll('button[class*="platform"], div[class*="platform"]');
console.log('找到平台选择按钮数量:', platformButtons.length);

// 测试6: 检查错误信息
console.log('\n6. 检查控制台错误:');
const errors = [];
const originalError = console.error;
console.error = function(...args) {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

setTimeout(() => {
  console.error = originalError;
  if (errors.length > 0) {
    console.log('发现的错误:', errors);
  } else {
    console.log('✅ 未发现控制台错误');
  }
}, 1000);

console.log('\n=== 测试完成 ===');
console.log('请检查上述输出，如果发现问题请报告给开发者。');