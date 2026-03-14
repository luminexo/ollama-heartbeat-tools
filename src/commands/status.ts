import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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
    console.log('⚠ No se encontró archivo de configuración heartbeat.config.json');
    console.log('💡 Ejecuta "heartbeat init" para crear un nuevo proyecto');
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
  console.log('📊 Estado del Sistema de Heartbeats');
  console.log('');
  console.log('┌─────────────────────────────────────┐');
  console.log(`│ Proyecto: ${status.name.padEnd(26)}│`);
  console.log(`│ Versión:  ${status.version.padEnd(26)}│`);
  console.log('└─────────────────────────────────────┘');
  console.log('');
  
  console.log('💓 Heartbeats');
  console.log(`   Contador actual: ${status.heartbeatCount}`);
  console.log(`   Modo actual:    ${status.heartbeatCount % 2 === 1 ? 'A (Dominio GitHub)' : 'B (Exploración)'}`);
  console.log('');
  
  console.log('📁 Documentación');
  console.log(`   GOALS.md:   ${status.hasGoals ? '✓' : '✗'}`);
  console.log(`   MEMORY.md:  ${status.hasMemory ? '✓' : '✗'}`);
  console.log('');
  
  console.log('🔧 Git');
  if (status.isGitRepo) {
    console.log(`   Branch:     ${status.gitBranch}`);
    console.log(`   Limpio:     ${status.gitClean ? '✓' : '✗ (cambios pendientes)'}`);
  } else {
    console.log('   No es un repositorio git');
  }
  console.log('');
  
  console.log('🦙 Ollama');
  console.log(`   Habilitado: ${status.ollamaEnabled ? '✓' : '✗'}`);
  if (status.ollamaEnabled) {
    console.log(`   Modelo:     ${status.ollamaModel}`);
  }
}