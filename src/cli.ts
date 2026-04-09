#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand, listTemplatesCommand } from './commands/init';
import { runCommand } from './commands/run';
import { statusCommand } from './commands/status';
import { askCommand } from './commands/ask';
import { configCommand } from './commands/config';
import { validateCommand } from './commands/validate';
import { remoteCommand } from './commands/remote';
import { dashboardCommand } from './commands/dashboard';
import { logger } from './logger';

const program = new Command();

program
  .name('heartbeat')
  .description('Toolkit de utilidades para sistemas de heartbeat automatizados usando Ollama')
  .version('0.1.0')
  .option('-v, --verbose', 'Mostrar información detallada (debug level)', false)
  .option('-q, --quiet', 'Solo mostrar errores', false)
  .option('--log-file <path>', 'Archivo de log para persistencia')
  .option('--json-logs', 'Formato de log JSON (para CI/CD)', false)
  .hook('preAction', (thisCommand) => {
    const options = thisCommand.opts();
    if (options.quiet) {
      logger.setLevel('error');
    } else if (options.verbose) {
      logger.setLevel('debug');
    }
    if (options.logFile) {
      logger.setFile(options.logFile);
    }
    if (options.jsonLogs) {
      logger.setJsonMode(true);
      logger.setColors(false);
    }
  });

// Comandos principales
program
  .command('init [name]')
  .description('Inicializa un nuevo proyecto con heartbeats')
  .option('-t, --template <template>', 'Plantilla a usar', 'default')
  .option('-d, --directory <dir>', 'Directorio de destino', '.')
  .action(initCommand);

program
  .command('run')
  .description('Ejecuta un heartbeat manual')
  .option('-c, --config <file>', 'Archivo de configuración', 'heartbeat.config.json')
  .option('-v, --verbose', 'Mostrar salida detallada', false)
  .action(runCommand);

program
  .command('status')
  .description('Muestra el estado actual del sistema de heartbeats')
  .option('-j, --json', 'Salida en formato JSON', false)
  .action(statusCommand);

program
  .command('ask <prompt>')
  .description('Envía un prompt a Ollama y muestra la respuesta')
  .option('-m, --model <model>', 'Modelo a usar', 'llama3')
  .option('-v, --verbose', 'Mostrar información detallada', false)
  .action(askCommand);

program
  .command('config')
  .description('Gestiona la configuración de heartbeat y Ollama')
  .option('--list', 'Listar configuración actual')
  .option('--set <key=value>', 'Establecer un valor de configuración')
  .option('--ollama-url <url>', 'Establecer URL de Ollama')
  .option('--ollama-model <model>', 'Establecer modelo por defecto')
  .option('--check', 'Verificar conexión con Ollama')
  .action(configCommand);

program
  .command('validate')
  .description('Valida los archivos de configuración de heartbeat')
  .option('-v, --verbose', 'Mostrar información detallada', false)
  .option('-f, --fix', 'Intentar corregir errores automáticamente', false)
  .action(validateCommand);

program
  .command('templates')
  .description('Lista las plantillas disponibles para inicialización')
  .action(listTemplatesCommand);

program
  .command('remote')
  .description('Gestiona configuración remota de heartbeat')
  .option('--url <url>', 'URL de configuración remota')
  .option('--github <repo>', 'Repositorio GitHub (owner/repo)')
  .option('--branch <name>', 'Branch de GitHub', 'main')
  .option('--file <path>', 'Archivo en repo', 'heartbeat.config.json')
  .option('--pull', 'Descargar y guardar configuración', false)
  .option('--merge', 'Mezclar configuración remota con local', false)
  .option('--cache', 'Mostrar caché de configuración', false)
  .option('--clear-cache', 'Limpiar caché', false)
  .option('--validate', 'Validar URL remota', false)
  .option('-v, --verbose', 'Mostrar información detallada', false)
  .action(remoteCommand);

program
  .command('dashboard')
  .description('Inicia el servidor web de dashboard de estado')
  .option('-p, --port <port>', 'Puerto del servidor', '3000')
  .action(dashboardCommand);

program.parse();