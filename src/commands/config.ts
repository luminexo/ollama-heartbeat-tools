import fs from 'fs';
import path from 'path';
import { OllamaClient } from '../ollama/client';
import { OllamaStatus } from '../ollama/types';
import { logger } from '../logger';

interface ConfigOptions {
  list: boolean;
  set?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
  check: boolean;
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

const DEFAULT_CONFIG_FILE = 'heartbeat.config.json';

export async function configCommand(options: ConfigOptions) {
  const configPath = path.resolve(process.cwd(), DEFAULT_CONFIG_FILE);

  // Listar configuración actual
  if (options.list) {
    if (!fs.existsSync(configPath)) {
      logger.error('No existe archivo de configuración');
      logger.info('💡 Usa "heartbeat init" para crear un proyecto');
      return;
    }

    const config: HeartbeatConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    logger.info('📋 Configuración actual:');
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  // Verificar conexión Ollama
  if (options.check) {
    logger.progress('Verificando conexión con Ollama...');
    
    const client = new OllamaClient();
    const status: OllamaStatus = await client.getStatus();

    if (!status.available) {
      logger.error('Ollama no disponible');
      logger.error(`Error: ${status.error}`);
      logger.info('💡 Para solucionar:');
      logger.info('   1. Instala Ollama: https://ollama.ai');
      logger.info('   2. Inicia el servidor: ollama serve');
      return;
    }

    logger.success('Ollama disponible');
    logger.info('📦 Modelos instalados:');
    
    if (status.models.length === 0) {
      logger.info('   (ninguno)');
      logger.info('💡 Descarga un modelo: ollama pull llama3');
    } else {
      status.models.forEach(model => {
        logger.info(`   • ${model.name}`);
        logger.debug(`     Tamaño: ${OllamaClient.formatBytes(model.size)}`);
        if (model.details) {
          logger.debug(`     Familia: ${model.details.family}`);
          logger.debug(`     Parámetros: ${model.details.parameter_size}`);
        }
      });
    }

    // Verificar archivo de configuración
    if (fs.existsSync(configPath)) {
      const config: HeartbeatConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      logger.info('📋 Configuración Ollama:');
      logger.info(`   Base URL: ${config.ollama.baseUrl}`);
      logger.info(`   Modelo: ${config.ollama.model}`);
      logger.info(`   Habilitado: ${config.ollama.enabled ? 'Sí' : 'No'}`);
    }

    return;
  }

  // Establecer valores
  if (options.set || options.ollamaUrl || options.ollamaModel) {
    if (!fs.existsSync(configPath)) {
      logger.error('No existe archivo de configuración');
      logger.info('💡 Usa "heartbeat init" para crear un proyecto');
      return;
    }

    const config: HeartbeatConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Parsear valores a establecer
    if (options.set) {
      const [key, value] = options.set.split('=');
      if (key && value) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config as any)[key] = value;
      }
    }

    if (options.ollamaUrl) {
      config.ollama.baseUrl = options.ollamaUrl;
    }

    if (options.ollamaModel) {
      config.ollama.model = options.ollamaModel;
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    logger.success('Configuración actualizada');
    return;
  }

  // Sin opciones - mostrar ayuda
  logger.info('💡 Opciones disponibles:');
  logger.info('   --list         Listar configuración actual');
  logger.info('   --check        Verificar conexión con Ollama');
  logger.info('   --ollama-url   Establecer URL de Ollama');
  logger.info('   --ollama-model Establecer modelo por defecto');
  logger.info('📖 Ejemplos:');
  logger.info('   heartbeat config --check');
  logger.info('   heartbeat config --list');
  logger.info('   heartbeat config --ollama-model llama3');
}