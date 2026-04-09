/**
 * Abstract LLM client types
 * Supports multiple providers: Ollama, OpenAI, Anthropic
 */

/**
 * Base interface for all LLM providers
 */
export interface LLMClient {
  /**
   * Generate text completion
   */
  complete(prompt: string, options?: LLMCompletionOptions): Promise<LLMCompletionResponse>;
  
  /**
   * Check if the client is available/configured
   */
  isAvailable(): Promise<boolean>;
}

/**
 * Options for text completion
 */
export interface LLMCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
}

/**
 * Response from text completion
 */
export interface LLMCompletionResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * Configuration for LLM providers
 */
export interface LLMProviderConfig {
  provider: 'ollama' | 'openai' | 'anthropic';
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  enabled: boolean;
}
