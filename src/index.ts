// CLI exports
export { initCommand } from './commands/init';
export { runCommand } from './commands/run';
export { statusCommand } from './commands/status';
export { askCommand } from './commands/ask';
export { configCommand } from './commands/config';
export { validateCommand } from './commands/validate';

// Ollama client
export { OllamaClient } from './ollama/client';
export type { OllamaModel, OllamaGenerateRequest, OllamaGenerateResponse, OllamaStatus } from './ollama/types';

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