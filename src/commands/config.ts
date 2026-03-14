import fs from 'fs';
import path from 'path';
import { OllamaClient } from '../ollama/client';
import { OllamaStatus } from '../ollama/types';

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
      console.log('❌ No existe archivo de configuración');
      console.log('💡 Usa "heartbeat init" para crear un proyecto');
      return;
    }

    const config: HeartbeatConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log('📋 Configuración actual:');
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  // Verificar conexión Ollama
  if (options.check) {
    console.log('🔍 Verificando conexión con Ollama...\n');
    
    const client = new OllamaClient();
    const status: OllamaStatus = await client.getStatus();

    if (!status.available) {
      console.log('❌ Ollama no disponible');
      console.log(`   Error: ${status.error}`);
      console.log('\n💡 Para solucionar:');
      console.log('   1. Instala Ollama: https://ollama.ai');
      console.log('   2. Inicia el servidor: ollama serve');
      return;
    }

    console.log('✅ Ollama disponible\n');
    console.log('📦 Modelos instalados:');
    
    if (status.models.length === 0) {
      console.log('   (ninguno)');
      console.log('\n💡 Descarga un modelo: ollama pull llama3');
    } else {
      status.models.forEach(model => {
        console.log(`   • ${model.name}`);
        console.log(`     Tamaño: ${OllamaClient.formatBytes(model.size)}`);
        if (model.details) {
          console.log(`     Familia: ${model.details.family}`);
          console.log(`     Parámetros: ${model.details.parameter_size}`);
        }
        console.log('');
      });
    }

    // Verificar archivo de configuración
    if (fs.existsSync(configPath)) {
      const config: HeartbeatConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      console.log('📋 Configuración Ollama:');
      console.log(`   Base URL: ${config.ollama.baseUrl}`);
      console.log(`   Modelo: ${config.ollama.model}`);
      console.log(`   Habilitado: ${config.ollama.enabled ? 'Sí' : 'No'}`);
    }

    return;
  }

  // Establecer valores
  if (options.set || options.ollamaUrl || options.ollamaModel) {
    if (!fs.existsSync(configPath)) {
      console.log('❌ No existe archivo de configuración');
      console.log('💡 Usa "heartbeat init" para crear un proyecto');
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
    console.log('✅ Configuración actualizada');
    return;
  }

  // Sin opciones - mostrar ayuda
  console.log('💡 Opciones disponibles:');
  console.log('   --list         Listar configuración actual');
  console.log('   --check        Verificar conexión con Ollama');
  console.log('   --ollama-url   Establecer URL de Ollama');
  console.log('   --ollama-model Establecer modelo por defecto');
  console.log('\n📖 Ejemplos:');
  console.log('   heartbeat config --check');
  console.log('   heartbeat config --list');
  console.log('   heartbeat config --ollama-model llama3');
}