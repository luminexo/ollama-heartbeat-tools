import { OllamaClient } from '../ollama/client';
import { OllamaStatus } from '../ollama/types';

interface AskOptions {
  model: string;
  verbose: boolean;
  config?: string;
}

export async function askCommand(prompt: string, options: AskOptions) {
  const client = new OllamaClient();

  console.log('🦙 Consultando Ollama...');
  
  if (options.verbose) {
    console.log(`   Modelo: ${options.model}`);
    console.log(`   Prompt: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`);
  }

  // Verificar disponibilidad
  const status: OllamaStatus = await client.getStatus();
  
  if (!status.available) {
    console.error(`❌ Ollama no disponible: ${status.error}`);
    console.log('💡 Asegúrate de que Ollama está instalado y el servidor está corriendo:');
    console.log('   ollama serve');
    process.exit(1);
  }

  // Verificar que el modelo existe
  const modelExists = status.models.some(m => m.name === options.model || m.name.startsWith(options.model + ':'));
  if (!modelExists) {
    console.error(`❌ Modelo "${options.model}" no encontrado`);
    console.log('📋 Modelos disponibles:');
    status.models.forEach(m => {
      console.log(`   - ${m.name} (${OllamaClient.formatBytes(m.size)})`);
    });
    console.log(`\n💡 Descarga el modelo con: ollama pull ${options.model}`);
    process.exit(1);
  }

  try {
    const startTime = Date.now();
    const response = await client.ask(prompt, options.model);
    const duration = Date.now() - startTime;

    console.log('\n' + response);
    
    if (options.verbose) {
      console.log(`\n⏱️ Tiempo: ${OllamaClient.formatDuration(duration)}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error}`);
    process.exit(1);
  }
}