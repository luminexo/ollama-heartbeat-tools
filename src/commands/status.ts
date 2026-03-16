import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { logger } from '../logger';

interface StatusOptions {
  json: boolean;
}

interface ProjectStatus {
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
}

export function statusCommand(options: StatusOptions) {
  const configPath = findConfigFile();
  
  if (!configPath) {
    logger.warn('No se encontró archivo de configuración heartbeat.config.json');
    logger.info('💡 Ejecuta "heartbeat init" para crear un nuevo proyecto');
    return;
  }

  const projectDir = path.dirname(configPath);
  const status: ProjectStatus = loadStatus(configPath, projectDir);
  
  if (options.json) {
    console.log(JSON.stringify(status, null, 2));
  } else {
    printStatus(status);
  }
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

function loadStatus(configPath: string, projectDir: string): ProjectStatus {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  
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
  };
}

function printStatus(status: ProjectStatus) {
  logger.info('📊 Estado del Sistema de Heartbeats');
  logger.info('');
  logger.info('┌─────────────────────────────────────┐');
  logger.info(`│ Proyecto: ${status.name.padEnd(26)}│`);
  logger.info(`│ Versión:  ${status.version.padEnd(26)}│`);
  logger.info('└─────────────────────────────────────┘');
  logger.info('');
  
  logger.info('💓 Heartbeats');
  logger.info(`   Contador actual: ${status.heartbeatCount}`);
  logger.info(`   Modo actual:    ${status.heartbeatCount % 2 === 1 ? 'A (Dominio GitHub)' : 'B (Exploración)'}`);
  logger.info('');
  
  logger.info('📁 Documentación');
  logger.info(`   GOALS.md:   ${status.hasGoals ? '✓' : '✗'}`);
  logger.info(`   MEMORY.md:  ${status.hasMemory ? '✓' : '✗'}`);
  logger.info('');
  
  logger.info('🔧 Git');
  if (status.isGitRepo) {
    logger.info(`   Branch:     ${status.gitBranch}`);
    logger.info(`   Limpio:     ${status.gitClean ? '✓' : '✗ (cambios pendientes)'}`);
  } else {
    logger.info('   No es un repositorio git');
  }
  logger.info('');
  
  logger.info('🦙 Ollama');
  logger.info(`   Habilitado: ${status.ollamaEnabled ? '✓' : '✗'}`);
  if (status.ollamaEnabled) {
    logger.info(`   Modelo:     ${status.ollamaModel}`);
  }
}