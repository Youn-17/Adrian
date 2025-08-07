import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// API平台配置
const API_PLATFORMS = {
  deepseek: {
    name: 'DeepSeek',
    description: '深度求索AI平台，提供强大的文本分析能力',
    placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.deepseek.com',
    testEndpoint: 'https://api.deepseek.com/v1/models',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    icon: '🧠'
  },
  openai: {
    name: 'OpenAI',
    description: 'OpenAI GPT系列模型，支持多种AI任务',
    placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.openai.com/v1',
    testEndpoint: 'https://api.openai.com/v1/models',
    models: ['gpt-4', 'gpt-3.5-turbo'],
    icon: '🤖'
  },
  claude: {
    name: 'Claude (Anthropic)',
    description: 'Anthropic Claude模型，擅长分析和推理',
    placeholder: 'sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.anthropic.com',
    testEndpoint: 'https://api.anthropic.com/v1/models',
    models: ['claude-3-opus', 'claude-3-sonnet'],
    icon: '🎭'
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Google Gemini模型，多模态AI能力',
    placeholder: 'AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    testEndpoint: 'https://generativelanguage.googleapis.com/v1/models',
    models: ['gemini-pro', 'gemini-pro-vision'],
    icon: '💎'
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    description: 'Moonshot AI Kimi模型，支持长文本处理',
    placeholder: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.moonshot.cn/v1',
    testEndpoint: 'https://api.moonshot.cn/v1/models',
    models: ['kimi-k2-0711-preview', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    icon: '🌙'
  },
  zhipu: {
    name: '智谱AI',
    description: '智谱AI GLM系列模型，中文理解能力强',
    placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxx',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    testEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: ['glm-4-plus', 'glm-4-air', 'glm-4-flash'],
    icon: '🧮'
  },
  doubao: {
    name: '豆包 (火山引擎)',
    description: '火山引擎豆包大模型，企业级AI服务',
    placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    testEndpoint: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    models: ['doubao-pro', 'doubao-lite'],
    icon: '🫘'
  },
  grok: {
    name: 'Grok (xAI)',
    description: 'xAI Grok模型，具备实时信息获取能力',
    placeholder: 'xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    baseUrl: 'https://api.x.ai/v1',
    testEndpoint: 'https://api.x.ai/v1/models',
    models: ['grok-beta', 'grok-vision-beta'],
    icon: '🚀'
  }
};

interface ApiKey {
  platform: string;
  key: string;
  isValid?: boolean;
  lastValidated?: string;
}

interface ApiKeyManagerProps {
  onApiKeysChange?: (apiKeys: Record<string, ApiKey>) => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onApiKeysChange }) => {
  const [apiKeys, setApiKeys] = useState<Record<string, ApiKey>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [validatingKeys, setValidatingKeys] = useState<Record<string, boolean>>({});
  const [selectedPlatform, setSelectedPlatform] = useState<string>('deepseek');

  // 从本地存储加载API密钥
  useEffect(() => {
    const savedKeys = localStorage.getItem('api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(parsed);
      } catch (error) {
        console.error('Failed to parse saved API keys:', error);
      }
    }
  }, []);

  // 保存API密钥到本地存储
  const saveApiKeys = (keys: Record<string, ApiKey>) => {
    localStorage.setItem('api_keys', JSON.stringify(keys));
    setApiKeys(keys);
    onApiKeysChange?.(keys);
  };

  // 验证API密钥
  const validateApiKey = async (platform: string, key: string): Promise<boolean> => {
    if (!key.trim()) return false;

    setValidatingKeys(prev => ({ ...prev, [platform]: true }));

    try {
      const platformConfig = API_PLATFORMS[platform as keyof typeof API_PLATFORMS];
      if (!platformConfig) return false;

      // 根据不同平台使用不同的验证方法
      let isValid = false;

      switch (platform) {
        case 'deepseek':
          isValid = await validateDeepSeekKey(key);
          break;
        case 'openai':
          isValid = await validateOpenAIKey(key);
          break;
        case 'claude':
          isValid = await validateClaudeKey(key);
          break;
        case 'gemini':
          isValid = await validateGeminiKey(key);
          break;
        case 'kimi':
          isValid = await validateKimiKey(key);
          break;
        case 'zhipu':
          isValid = await validateZhipuKey(key);
          break;
        case 'doubao':
          isValid = await validateDoubaoKey(key);
          break;
        case 'grok':
          isValid = await validateGrokKey(key);
          break;
        default:
          isValid = false;
      }

      return isValid;
    } catch (error) {
      console.error(`Failed to validate ${platform} API key:`, error);
      return false;
    } finally {
      setValidatingKeys(prev => ({ ...prev, [platform]: false }));
    }
  };

  // DeepSeek API密钥验证
  const validateDeepSeekKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // OpenAI API密钥验证
  const validateOpenAIKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Claude API密钥验证
  const validateClaudeKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });
      return response.status !== 401;
    } catch {
      return false;
    }
  };

  // Gemini API密钥验证
  const validateGeminiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
      return response.ok;
    } catch {
      return false;
    }
  };

  // Kimi API密钥验证
  const validateKimiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.moonshot.cn/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // 智谱AI API密钥验证
  const validateZhipuKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'glm-4-air',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      });
      return response.status !== 401 && response.status !== 403;
    } catch {
      return false;
    }
  };

  // 豆包 API密钥验证
  const validateDoubaoKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'doubao-lite',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        })
      });
      return response.status !== 401 && response.status !== 403;
    } catch {
      return false;
    }
  };

  // Grok API密钥验证
   const validateGrokKey = async (key: string): Promise<boolean> => {
     try {
       const response = await fetch('https://api.x.ai/v1/models', {
         headers: {
           'Authorization': `Bearer ${key}`,
           'Content-Type': 'application/json'
         }
       });
       return response.ok;
     } catch {
       return false;
     }
   };
 
    // 处理API密钥输入
  const handleKeyChange = (platform: string, key: string) => {
    const updatedKeys = {
      ...apiKeys,
      [platform]: {
        platform,
        key: key.trim(),
        isValid: undefined,
        lastValidated: undefined
      }
    };
    saveApiKeys(updatedKeys);
  };

  // 验证并保存API密钥
  const handleValidateKey = async (platform: string) => {
    const key = apiKeys[platform]?.key;
    if (!key) {
      toast.error('请先输入API密钥');
      return;
    }

    const isValid = await validateApiKey(platform, key);
    const updatedKeys = {
      ...apiKeys,
      [platform]: {
        ...apiKeys[platform],
        isValid,
        lastValidated: new Date().toISOString()
      }
    };

    saveApiKeys(updatedKeys);

    if (isValid) {
      toast.success(`${API_PLATFORMS[platform as keyof typeof API_PLATFORMS].name} API密钥验证成功`);
    } else {
      toast.error(`${API_PLATFORMS[platform as keyof typeof API_PLATFORMS].name} API密钥验证失败`);
    }
  };

  // 删除API密钥
  const handleDeleteKey = (platform: string) => {
    const updatedKeys = { ...apiKeys };
    delete updatedKeys[platform];
    saveApiKeys(updatedKeys);
    toast.success('API密钥已删除');
  };

  // 切换密钥显示/隐藏
  const toggleKeyVisibility = (platform: string) => {
    setShowKeys(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  // 获取有效的API密钥数量
  const getValidKeyCount = () => {
    return Object.values(apiKeys).filter(key => key.isValid).length;
  };

  return (
    <div className="space-y-6">
      {/* 概览卡片 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API密钥管理
            </h3>
            <p className="text-blue-700 text-sm">
              配置您的AI平台API密钥以启用智能分析功能
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">{getValidKeyCount()}</div>
            <div className="text-sm text-blue-700">已配置平台</div>
          </div>
        </div>
      </div>

      {/* 平台选择 */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h4 className="font-medium text-gray-900 mb-4">选择AI平台</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(API_PLATFORMS).map(([key, platform]) => {
            const apiKey = apiKeys[key];
            const isSelected = selectedPlatform === key;
            const hasKey = apiKey?.key;
            const isValid = apiKey?.isValid;

            return (
              <button
                key={key}
                onClick={() => setSelectedPlatform(key)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{platform.icon}</span>
                    <span className="font-medium text-gray-900">{platform.name}</span>
                  </div>
                  {hasKey && (
                    <div className="flex items-center">
                      {isValid === true && <Check className="h-4 w-4 text-green-500" />}
                      {isValid === false && <X className="h-4 w-4 text-red-500" />}
                      {isValid === undefined && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">{platform.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* API密钥配置 */}
      {selectedPlatform && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <span className="text-xl mr-2">
                {API_PLATFORMS[selectedPlatform as keyof typeof API_PLATFORMS].icon}
              </span>
              配置 {API_PLATFORMS[selectedPlatform as keyof typeof API_PLATFORMS].name} API密钥
            </h4>
            {apiKeys[selectedPlatform]?.lastValidated && (
              <span className="text-xs text-gray-500">
                最后验证: {new Date(apiKeys[selectedPlatform].lastValidated!).toLocaleString()}
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API密钥
              </label>
              <div className="relative">
                <input
                  type={showKeys[selectedPlatform] ? 'text' : 'password'}
                  value={apiKeys[selectedPlatform]?.key || ''}
                  onChange={(e) => handleKeyChange(selectedPlatform, e.target.value)}
                  placeholder={API_PLATFORMS[selectedPlatform as keyof typeof API_PLATFORMS].placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility(selectedPlatform)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showKeys[selectedPlatform] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {apiKeys[selectedPlatform]?.isValid === true && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {apiKeys[selectedPlatform]?.isValid === false && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleValidateKey(selectedPlatform)}
                disabled={!apiKeys[selectedPlatform]?.key || validatingKeys[selectedPlatform]}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {validatingKeys[selectedPlatform] ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                {validatingKeys[selectedPlatform] ? '验证中...' : '验证密钥'}
              </button>

              {apiKeys[selectedPlatform]?.key && (
                <button
                  onClick={() => handleDeleteKey(selectedPlatform)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  删除密钥
                </button>
              )}
            </div>

            {/* 状态提示 */}
            {apiKeys[selectedPlatform]?.isValid === false && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">
                    API密钥验证失败，请检查密钥是否正确或网络连接是否正常
                  </span>
                </div>
              </div>
            )}

            {apiKeys[selectedPlatform]?.isValid === true && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-green-700">
                    API密钥验证成功，您现在可以使用 {API_PLATFORMS[selectedPlatform as keyof typeof API_PLATFORMS].name} 进行AI分析
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          重要说明
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• API密钥仅存储在您的本地浏览器中，不会上传到服务器</li>
          <li>• 请妥善保管您的API密钥，避免泄露给他人</li>
          <li>• 不同AI平台的API密钥格式和获取方式可能不同</li>
          <li>• 验证成功后才能在分析功能中使用对应的AI平台</li>
          <li>• 建议定期更换API密钥以确保安全</li>
        </ul>
      </div>
    </div>
  );
};

export default ApiKeyManager;