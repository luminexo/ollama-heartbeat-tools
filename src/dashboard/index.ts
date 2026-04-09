import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface DashboardOptions {
  port: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
}

export interface ProjectStatusData {
  name: string;
  version: string;
  heartbeatCount: number;
  hasGoals: boolean;
  hasMemory: boolean;
  isGitRepo: boolean;
  gitBranch?: string;
  gitClean?: boolean;
  ollamaEnabled: boolean;
  ollamaModel: string;
  timestamp: string;
}

export function startDashboard(options: DashboardOptions): void {
  const app = express();
  const port = options.port;

  // Health endpoint
  app.get('/health', (req: Request, res: Response) => {
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '0.1.0'
    };
    res.status(200).json(health);
  });

  // Status endpoint
  app.get('/status', (req: Request, res: Response) => {
    const status = loadProjectStatus();
    res.status(200).json(status);
  });

  // Root endpoint
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'Heartbeat Dashboard',
      endpoints: ['/health', '/status'],
      version: '0.1.0'
    });
  });

  app.listen(port, () => {
    console.log(`🚀 Dashboard server running on http://localhost:${port}`);
    console.log(`   Health:  http://localhost:${port}/health`);
    console.log(`   Status:  http://localhost:${port}/status`);
  });
}

function loadProjectStatus(): ProjectStatusData {
  const configPath = findConfigFile();
  const projectDir = configPath ? path.dirname(configPath) : process.cwd();
  
  let config: any = { name: 'unknown', version: '0.0.0', ollama: {} };
  if (configPath && fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch {
      // Use default config
    }
  }
  
  // Leer contador
  let heartbeatCount = 0;
  const counterPath = path.join(projectDir, 'HEARTBEAT_COUNTER.md');
  if (fs.existsSync(counterPath)) {
    const counterContent = fs.readFileSync(counterPath, 'utf-8');
    const match = counterContent.match(/\*\*Contador:\*\*\s*(\d+)/);
    if (match) {
      heartbeatCount = parseInt(match[1], 10);
    }
  }

  // Verificar archivos de documentación
  const hasGoals = fs.existsSync(path.join(projectDir, 'GOALS.md'));
  const hasMemory = fs.existsSync(path.join(projectDir, 'MEMORY.md'));

  // Verificar estado git
  let isGitRepo = false;
  let gitBranch: string | undefined;
  let gitClean: boolean | undefined;
  
  try {
    gitBranch = execSync('git branch --show-current', { 
      encoding: 'utf-8', 
      cwd: projectDir,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    gitClean = execSync('git status --porcelain', { 
      encoding: 'utf-8', 
      cwd: projectDir,
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim() === '';
    isGitRepo = true;
  } catch {
    // No es un repositorio git
  }

  return {
    name: config.name,
    version: config.version,
    heartbeatCount,
    hasGoals,
    hasMemory,
    isGitRepo,
    gitBranch,
    gitClean,
    ollamaEnabled: config.ollama?.enabled ?? false,
    ollamaModel: config.ollama?.model ?? 'none',
    timestamp: new Date().toISOString()
  };
}

function findConfigFile(): string | null {
  const configName = 'heartbeat.config.json';
  let currentDir = process.cwd();
  
  // Buscar en directorios padre hasta encontrar el archivo
  while (currentDir !== '/') {
    const configPath = path.join(currentDir, configName);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    currentDir = path.dirname(currentDir);
  }
  
  return null;
}
