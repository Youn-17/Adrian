interface ApiKey {
  platform: string;
  key: string;
  isValid?: boolean;
  lastValidated?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface AIServiceConfig {
  maxTokens: number;
  temperature: number;
}

class AIService {
  private config: AIServiceConfig;

  constructor() {
    this.config = {
      maxTokens: 2000,
      temperature: 0.3
    };
  }

  // 获取存储的API密钥
  private getApiKeys(): Record<string, ApiKey> {
    try {
      const savedKeys = localStorage.getItem('api_keys');
      return savedKeys ? JSON.parse(savedKeys) : {};
    } catch {
      return {};
    }
  }

  // 获取有效的API密钥
  private getValidApiKey(platform: string): string | null {
    const apiKeys = this.getApiKeys();
    const apiKey = apiKeys[platform];
    
    if (apiKey && apiKey.isValid && apiKey.key) {
      return apiKey.key;
    }
    
    return null;
  }

  // 检查是否有可用的AI平台
  public hasValidApiKey(): boolean {
    const apiKeys = this.getApiKeys();
    return Object.values(apiKeys).some(key => key.isValid && key.key);
  }

  // 获取可用的AI平台列表
  public getAvailablePlatforms(): string[] {
    const apiKeys = this.getApiKeys();
    return Object.keys(apiKeys).filter(platform => {
      const key = apiKeys[platform];
      return key.isValid && key.key;
    });
  }

  // DeepSeek API调用
  private async callDeepSeek(messages: ChatMessage[], apiKey: string): Promise<ChatCompletionResponse> {
    const url = 'https://api.deepseek.com/v1/chat/completions';
    
    const requestBody = {
      model: 'deepseek-chat',
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DeepSeek API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  // OpenAI API调用
  private async callOpenAI(messages: ChatMessage[], apiKey: string): Promise<ChatCompletionResponse> {
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  }

  // Claude API调用
  private async callClaude(messages: ChatMessage[], apiKey: string): Promise<ChatCompletionResponse> {
    const url = 'https://api.anthropic.com/v1/messages';
    
    // 转换消息格式
    const claudeMessages = messages.filter(msg => msg.role !== 'system').map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const systemMessage = messages.find(msg => msg.role === 'system')?.content || '';

    const requestBody = {
      model: 'claude-3-haiku-20240307',
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      system: systemMessage,
      messages: claudeMessages
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const claudeResponse = await response.json();
    
    // 转换为统一格式
    return {
      id: claudeResponse.id,
      object: 'chat.completion',
      created: Date.now(),
      model: claudeResponse.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: claudeResponse.content[0]?.text || ''
        },
        finish_reason: claudeResponse.stop_reason || 'stop'
      }],
      usage: {
        prompt_tokens: claudeResponse.usage?.input_tokens || 0,
        completion_tokens: claudeResponse.usage?.output_tokens || 0,
        total_tokens: (claudeResponse.usage?.input_tokens || 0) + (claudeResponse.usage?.output_tokens || 0)
      }
    };
  }

  // Gemini API调用
  private async callGemini(messages: ChatMessage[], apiKey: string): Promise<ChatCompletionResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
    
    // 转换消息格式
    const parts = messages.map(msg => ({
      text: `${msg.role}: ${msg.content}`
    }));

    const requestBody = {
      contents: [{
        parts: parts
      }],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const geminiResponse = await response.json();
    
    // 转换为统一格式
    return {
      id: 'gemini-' + Date.now(),
      object: 'chat.completion',
      created: Date.now(),
      model: 'gemini-pro',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: geminiResponse.candidates?.[0]?.content?.parts?.[0]?.text || ''
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  }

  // 智能选择最佳可用平台进行API调用
  public async chatCompletion(messages: ChatMessage[], preferredPlatform?: string): Promise<ChatCompletionResponse> {
    const availablePlatforms = this.getAvailablePlatforms();
    
    if (availablePlatforms.length === 0) {
      throw new Error('没有可用的AI平台API密钥，请先在设置中配置API密钥');
    }

    // 确定使用的平台
    let platformToUse = preferredPlatform;
    if (!platformToUse || !availablePlatforms.includes(platformToUse)) {
      // 优先级：DeepSeek > OpenAI > Claude > Gemini
      const priorityOrder = ['deepseek', 'openai', 'claude', 'gemini'];
      platformToUse = priorityOrder.find(p => availablePlatforms.includes(p)) || availablePlatforms[0];
    }

    const apiKey = this.getValidApiKey(platformToUse);
    if (!apiKey) {
      throw new Error(`${platformToUse} API密钥无效`);
    }

    try {
      switch (platformToUse) {
        case 'deepseek':
          return await this.callDeepSeek(messages, apiKey);
        case 'openai':
          return await this.callOpenAI(messages, apiKey);
        case 'claude':
          return await this.callClaude(messages, apiKey);
        case 'gemini':
          return await this.callGemini(messages, apiKey);
        default:
          throw new Error(`不支持的AI平台: ${platformToUse}`);
      }
    } catch (error) {
      console.error(`${platformToUse} API调用失败:`, error);
      
      // 如果当前平台失败，尝试其他可用平台
      const otherPlatforms = availablePlatforms.filter(p => p !== platformToUse);
      if (otherPlatforms.length > 0) {
        console.log(`尝试使用备用平台: ${otherPlatforms[0]}`);
        return await this.chatCompletion(messages, otherPlatforms[0]);
      }
      
      throw error;
    }
  }

  // 检查API连接状态
  public async checkConnection(platform?: string): Promise<{ platform: string; connected: boolean }[]> {
    const availablePlatforms = platform ? [platform] : this.getAvailablePlatforms();
    const results: { platform: string; connected: boolean }[] = [];

    for (const platformName of availablePlatforms) {
      try {
        const response = await this.chatCompletion([
          { role: 'user', content: '你好，请回复"连接成功"' }
        ], platformName);
        
        const connected = response.choices[0]?.message?.content?.includes('连接成功') || 
                         response.choices[0]?.message?.content?.length > 0;
        
        results.push({ platform: platformName, connected });
      } catch {
        results.push({ platform: platformName, connected: false });
      }
    }

    return results;
  }

  // 更新配置
  public updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 获取当前配置
  public getConfig(): AIServiceConfig {
    return { ...this.config };
  }
}

export const aiService = new AIService();
export type { ChatMessage, ChatCompletionResponse, AIServiceConfig };