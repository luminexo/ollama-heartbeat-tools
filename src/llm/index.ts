/**
 * LLM Client implementations
 * Supports Ollama, OpenAI, and Anthropic
 */

import https from 'https';
import http from 'http';
import {
  LLMClient,
  LLMCompletionOptions,
  LLMCompletionResponse,
  LLMProviderConfig
} from './types';

/**
 * HTTP request helper
 */
async function makeHTTPRequest(
  baseUrl: string,
  path: string,
  headers: Record<string, string>,
  body?: object,
  timeout = 60000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      },
      timeout
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : null);
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

/**
 * Ollama LLM Client
 */
export class OllamaLLMClient implements LLMClient {
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await makeHTTPRequest(
        this.config.baseUrl || 'http://localhost:11434',
        '/api/tags',
        {},
        undefined,
        5000
      );
      return response !== null;
    } catch {
      return false;
    }
  }

  async complete(
    prompt: string,
    options: LLMCompletionOptions = {}
  ): Promise<LLMCompletionResponse> {
    const model = options.model || this.config.defaultModel || 'llama3';
    
    const response = await makeHTTPRequest(
      this.config.baseUrl || 'http://localhost:11434',
      '/api/generate',
      {},
      {
        model,
        prompt,
        stream: false,
        options: {
          temperature: options.temperature,
          top_p: options.topP,
          num_ctx: options.maxTokens ? Math.min(options.maxTokens, 8192) : undefined
        }
      }
    );

    return {
      text: response?.response || '',
      model: response?.model || model,
      usage: {
        promptTokens: response?.prompt_eval_count,
        completionTokens: response?.eval_count,
        totalTokens: (response?.prompt_eval_count || 0) + (response?.eval_count || 0)
      }
    };
  }
}

/**
 * OpenAI LLM Client
 */
export class OpenAILLMClient implements LLMClient {
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.config.apiKey;
  }

  async complete(
    prompt: string,
    options: LLMCompletionOptions = {}
  ): Promise<LLMCompletionResponse> {
    const model = options.model || this.config.defaultModel || 'gpt-4o-mini';
    
    const response = await makeHTTPRequest(
      'https://api.openai.com',
      '/v1/chat/completions',
      {
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens,
        top_p: options.topP || 1
      }
    );

    const choice = response?.choices?.[0];
    return {
      text: choice?.message?.content || '',
      model: response?.model || model,
      usage: {
        promptTokens: response?.usage?.prompt_tokens,
        completionTokens: response?.usage?.completion_tokens,
        totalTokens: response?.usage?.total_tokens
      }
    };
  }
}

/**
 * Anthropic Claude LLM Client
 */
export class AnthropicLLMClient implements LLMClient {
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.config.apiKey;
  }

  async complete(
    prompt: string,
    options: LLMCompletionOptions = {}
  ): Promise<LLMCompletionResponse> {
    const model = options.model || this.config.defaultModel || 'claude-3-haiku-20240307';
    
    const response = await makeHTTPRequest(
      'https://api.anthropic.com',
      '/v1/messages',
      {
        'x-api-key': this.config.apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      {
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature
      }
    );

    return {
      text: response?.content?.[0]?.text || '',
      model: response?.model || model,
      usage: {
        promptTokens: response?.usage?.input_tokens,
        completionTokens: response?.usage?.output_tokens,
        totalTokens: (response?.usage?.input_tokens || 0) + (response?.usage?.output_tokens || 0)
      }
    };
  }
}

/**
 * LLM Client factory
 */
export class LLMClientFactory {
  static create(config: LLMProviderConfig): LLMClient {
    switch (config.provider) {
      case 'ollama':
        return new OllamaLLMClient(config);
      case 'openai':
        return new OpenAILLMClient(config);
      case 'anthropic':
        return new AnthropicLLMClient(config);
      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }
}

export * from './types';
