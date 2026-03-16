import { OllamaClient } from '../ollama/client';
import { OllamaStatus } from '../ollama/types';
import { logger } from '../logger';

interface AskOptions {
  model: string;
  verbose: boolean;
  config?: string;
}

export async function askCommand(prompt: string, options: AskOptions) {
  const client = new OllamaClient();

  logger.info('🦙 Consultando Ollama...');
  
  if (options.verbose) {
    logger.debug(`   Modelo: ${options.model}`);
    logger.debug(`   Prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`);
  }

  // Verificar disponibilidad
  const status: OllamaStatus = await client.getStatus();
  
  if (!status.available) {
    logger.error(`Ollama no disponible: ${status.error}`);
    logger.info('💡 Asegúrate de que Ollama está instalado y el servidor está corriendo:');
    logger.info('   ollama serve');
    process.exit(1);
  }

  // Verificar que el modelo existe
  const modelExists = status.models.some(m => m.name === options.model || m.name.startsWith(options.model + ':'));
  if (!modelExists) {
    logger.error(`Modelo "${options.model}" no encontrado`);
    logger.info('📋 Modelos disponibles:');
    status.models.forEach(m => {
      logger.info(`   - ${m.name} (${OllamaClient.formatBytes(m.size)})`);
    });
    logger.info('');
    logger.info(`💡 Descarga el modelo con: ollama pull ${options.model}`);
    process.exit(1);
  }

  try {
    const startTime = Date.now();
    const response = await client.ask(prompt, options.model);
    const duration = Date.now() - startTime;

    logger.info('\n' + response);
    
    if (options.verbose) {
      logger.debug(`\n⏱️ Tiempo: ${OllamaClient.formatDuration(duration)}`);
    }
  } catch (error) {
    logger.error(`Error: ${error}`);
    process.exit(1);
  }
}