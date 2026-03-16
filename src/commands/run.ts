import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { logger } from '../logger';

interface RunOptions {
  config: string;
  verbose: boolean;
}

interface HeartbeatConfig {
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

export async function runCommand(options: RunOptions) {
  logger.info('💓 Ejecutando heartbeat...');
  
  const configPath = path.resolve(options.config);
  
  if (!fs.existsSync(configPath)) {
    logger.error(`Archivo de configuración no encontrado: ${configPath}`);
    logger.info('💡 Usa "heartbeat init" para crear un nuevo proyecto');
    process.exit(1);
  }

  let config: HeartbeatConfig;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch (error) {
    logger.error('Error al leer el archivo de configuración');
    process.exit(1);
  }

  if (options.verbose) {
    logger.debug('📋 Configuración cargada:');
    logger.debug(`   Proyecto: ${config.name}`);
    logger.debug(`   Versión: ${config.version}`);
    logger.debug(`   Ollama: ${config.ollama.enabled ? 'habilitado' : 'deshabilitado'}`);
  }

  // Leer contador actual
  const counterPath = path.join(path.dirname(configPath), 'HEARTBEAT_COUNTER.md');
  let currentCount = 0;
  
  if (fs.existsSync(counterPath)) {
    const counterContent = fs.readFileSync(counterPath, 'utf-8');
    const match = counterContent.match(/\*\*Contador:\*\*\s*(\d+)/);
    if (match) {
      currentCount = parseInt(match[1], 10);
    }
  }

  const newCount = currentCount + 1;
  const isOdd = newCount % 2 === 1;
  const mode = isOdd ? 'A' : 'B';
  const modeName = isOdd ? 'Dominio de GitHub' : 'Exploración de Proyectos';

  logger.info(`📊 Heartbeat #${newCount}`);
  logger.info(`🔄 Modo: ${mode} - ${modeName}`);

  // Actualizar contador
  const timestamp = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0];
  
  let newCounterContent = fs.readFileSync(counterPath, 'utf-8');
  newCounterContent = newCounterContent.replace(
    /\*\*Contador:\*\*\s*\d+/,
    `**Contador:** ${newCount}`
  );
  
  // Añadir nueva línea al historial
  const historyLine = `| ${newCount} | ${timestamp} ${time} | ${mode} | Heartbeat ejecutado |\n`;
  newCounterContent = newCounterContent.replace(
    /(## Historial[\s\S]*?\n)(\n---)/,
    `$1${historyLine}\n---`
  );
  
  fs.writeFileSync(counterPath, newCounterContent);

  // Ejecutar acción según el modo
  if (isOdd) {
    await runModeA(config, options.verbose);
  } else {
    await runModeB(config, options.verbose);
  }

  logger.success('Heartbeat completado');
}

async function runModeA(config: HeartbeatConfig, verbose: boolean): Promise<void> {
  logger.info('🔧 Modo A: Dominio de GitHub');
  
  try {
    // Verificar estado de git
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    
    if (gitStatus.trim()) {
      logger.warn('📝 Cambios pendientes detectados');
      if (verbose) {
        logger.debug(gitStatus);
      }
    } else {
      logger.success('Repositorio limpio');
    }

    // Verificar autenticación GitHub
    try {
      execSync('gh auth status', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      logger.success('Autenticación GitHub verificada');
    } catch {
      logger.warn('⚠️ Autenticación GitHub no disponible');
    }
  } catch (error) {
    // No es un repositorio git, está bien para proyectos nuevos
    logger.info('ℹ️ No es un repositorio git');
  }
}

async function runModeB(config: HeartbeatConfig, verbose: boolean): Promise<void> {
  logger.info('🔍 Modo B: Exploración de Proyectos');
  
  // Listar archivos del proyecto
  const projectDir = process.cwd();
  const files = fs.readdirSync(projectDir).filter(f => !f.startsWith('.'));
  
  logger.info(`📁 Archivos en el proyecto (${files.length}):`);
  if (verbose) {
    files.forEach(f => logger.debug(`   - ${f}`));
  } else {
    logger.info(`   ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`);
  }

  // Verificar documentación
  const hasGoals = fs.existsSync(path.join(projectDir, 'GOALS.md'));
  const hasMemory = fs.existsSync(path.join(projectDir, 'MEMORY.md'));
  
  logger.info('📚 Documentación:');
  logger.info(`   GOALS.md: ${hasGoals ? '✓' : '✗'}`);
  logger.info(`   MEMORY.md: ${hasMemory ? '✓' : '✗'}`);
}