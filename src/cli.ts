#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { runCommand } from './commands/run';
import { statusCommand } from './commands/status';

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

program.parse();