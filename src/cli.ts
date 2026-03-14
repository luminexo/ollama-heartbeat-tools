#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand, listTemplatesCommand } from './commands/init';
import { runCommand } from './commands/run';
import { statusCommand } from './commands/status';
import { askCommand } from './commands/ask';
import { configCommand } from './commands/config';

const program = new Command();

program
  .name('heartbeat')
  .description('Toolkit de utilidades para sistemas de heartbeat automatizados usando Ollama')
  .version('0.1.0');

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
  .command('templates')
  .description('Lista las plantillas disponibles para inicialización')
  .action(listTemplatesCommand);

program.parse();