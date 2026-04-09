// CLI exports
export { initCommand, listTemplatesCommand } from './commands/init';
export { runCommand } from './commands/run';
export { statusCommand } from './commands/status';
export { askCommand } from './commands/ask';
export { configCommand } from './commands/config';
export { validateCommand } from './commands/validate';
export { remoteCommand } from './commands/remote';
export { dashboardCommand } from './commands/dashboard';

// Ollama client
export { OllamaClient } from './ollama/client';
export type { OllamaModel, OllamaGenerateRequest, OllamaGenerateResponse, OllamaStatus } from './ollama/types';

// Remote config
export { RemoteConfigLoader, formatBytes } from './config/remote';
export type { RemoteConfigOptions, RemoteConfigResult } from './config/remote';

// Dashboard
export { startDashboard } from './dashboard';
export type { DashboardOptions, HealthStatus, ProjectStatusData } from './dashboard';

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