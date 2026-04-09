/**
 * Provider command for managing LLM providers
 */

import fs from 'fs';
import path from 'path';
import { 
  LLMClientFactory
} from '../llm';
import { logger } from '../logger';

interface ProviderOptions {
  provider?: string;
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  list: boolean;
  test: boolean;
  prompt?: string;
}

interface HeartbeatConfig {
  name: string;
  version: string;
  llm?: {
    provider: 'ollama' | 'openai' | 'anthropic';
    apiKey?: string;
    baseUrl?: string;
    defaultModel?: string;
    enabled: boolean;
  };
}

const DEFAULT_CONFIG_FILE = 'heartbeat.config.json';

export async function providerCommand(options: ProviderOptions) {
  const configPath = path.resolve(process.cwd(), DEFAULT_CONFIG_FILE);

  // List available providers
  if (options.list) {
    logger.info('📋 Proveedores LLM disponibles:');
    logger.info('   • ollama - Ollama (local)');
    logger.info('   • openai - OpenAI GPT');
    logger.info('   • anthropic - Anthropic Claude');
    return;
  }

  // Load config
  if (!fs.existsSync(configPath)) {
    logger.error('No existe archivo de configuración');
    logger.info('💡 Usa "heartbeat init" para crear un proyecto');
    return;
  }

  const config: HeartbeatConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // Test provider
  if (options.test) {
    if (!config.llm || !config.llm.enabled) {
      logger.error('No hay proveedor LLM configurado');
      return;
    }

    logger.progress(`Probando proveedor ${config.llm.provider}...`);
    
    try {
      const client = LLMClientFactory.create(config.llm);
      const available = await client.isAvailable();
      
      if (available) {
        logger.success(`Proveedor ${config.llm.provider} disponible`);
        
        if (options.prompt) {
          logger.progress('Enviando prompt de prueba...');
          const response = await client.complete(options.prompt, {
            model: config.llm.defaultModel
          });
          logger.success('✅ Respuesta recibida');
          console.log('\n' + response.text);
        }
      } else {
        logger.error(`Proveedor ${config.llm.provider} no disponible`);
      }
    } catch (error) {
      logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
    return;
  }

  // Set provider
  if (options.provider) {
    const newLLMConfig = {
      provider: options.provider as 'ollama' | 'openai' | 'anthropic',
      enabled: true,
      ...config.llm
    };

    if (options.apiKey) newLLMConfig.apiKey = options.apiKey;
    if (options.baseUrl) newLLMConfig.baseUrl = options.baseUrl;
    if (options.defaultModel) newLLMConfig.defaultModel = options.defaultModel;

    config.llm = newLLMConfig;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    logger.success(`Proveedor configurado: ${options.provider}`);
    return;
  }

  // No options - show help
  logger.info('💡 Opciones disponibles:');
  logger.info('   --list              Listar proveedores');
  logger.info('   --provider <name>   Configurar proveedor');
  logger.info('   --api-key <key>    Establecer API key');
  logger.info('   --test              Probar proveedor');
}
