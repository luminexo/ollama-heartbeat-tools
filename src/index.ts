// CLI exports
export { initCommand, listTemplatesCommand } from './commands/init';
export { runCommand } from './commands/run';
export { statusCommand } from './commands/status';
export { askCommand } from './commands/ask';
export { configCommand } from './commands/config';
export { validateCommand } from './commands/validate';
export { remoteCommand } from './commands/remote';
export { notifyCommand } from './commands/notify';
export { providerCommand } from './commands/provider';

// Webhooks
export { WebhookClient, WebhookManager } from './webhooks';
export type { WebhookConfig, WebhookMessage, WebhookProvider } from './webhooks';

// LLM Clients
export { 
  LLMClientFactory, 
  OllamaLLMClient, 
  OpenAILLMClient, 
  AnthropicLLMClient 
} from './llm';
export type { 
  LLMClient, 
  LLMCompletionOptions, 
  LLMCompletionResponse, 
  LLMProviderConfig 
} from './llm/types';

// Remote config
export { RemoteConfigLoader, formatBytes } from './config/remote';
export type { RemoteConfigOptions, RemoteConfigResult } from './config/remote';

// Logger
export { Logger, logger } from './logger';
export type { LogLevel, LoggerOptions } from './logger';
export { setLevel, setFile, setJsonMode, setColors, setTimestamps, configure, debug, info, warn, error, success, progress } from './logger';

// Types
export interface HeartbeatConfig {
  name: string;
  version: string;
  heartbeat: {
    interval: number;
    maxRetries: number;
    timeout: number;
  };
  ollama: {
    enabled: boolean;
    baseUrl: string;
    model: string;
  };
  logging: {
    level: string;
    file: string;
  };
}