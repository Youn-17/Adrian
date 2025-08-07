interface DeepSeekConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
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

class DeepSeekAPI {
  private config: DeepSeekConfig;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
      baseURL: import.meta.env.VITE_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat',
      maxTokens: 2000,
      temperature: 0.3
    };

    if (!this.config.apiKey) {
      console.warn('DeepSeek API密钥未配置');
    }
  }

  async chatCompletion(messages: ChatMessage[]): Promise<ChatCompletionResponse> {
    const url = `${this.config.baseURL}/v1/chat/completions`;
    
    const requestBody: ChatCompletionRequest = {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DeepSeek API调用错误:', error);
      throw error;
    }
  }

  // 检查API连接状态
  async checkConnection(): Promise<boolean> {
    try {
      const response = await this.chatCompletion([
        { role: 'user', content: '你好，请回复"连接成功"' }
      ]);
      return response.choices[0]?.message?.content?.includes('连接成功') || false;
    } catch {
      return false;
    }
  }
}

export const deepSeekAPI = new DeepSeekAPI();
export type { ChatMessage, ChatCompletionResponse };