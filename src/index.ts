// CLI exports
export { initCommand } from './commands/init';
export { runCommand } from './commands/run';
export { statusCommand } from './commands/status';

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