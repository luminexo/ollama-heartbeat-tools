import fs from 'fs';
import path from 'path';
import { RemoteConfigLoader } from '../config/remote';
import { HeartbeatConfig } from '../index';

interface RemoteOptions {
  url?: string;
  github?: string;
  branch?: string;
  file?: string;
  pull: boolean;
  push: boolean;
  cache: boolean;
  clearCache: boolean;
  validate: boolean;
  merge: boolean;
  verbose: boolean;
}

const DEFAULT_CONFIG_FILE = 'heartbeat.config.json';

export async function remoteCommand(options: RemoteOptions) {
  const loader = new RemoteConfigLoader();
  const configPath = path.resolve(process.cwd(), DEFAULT_CONFIG_FILE);

  // Limpiar caché
  if (options.clearCache) {
    loader.clearCache();
    console.log('✅ Caché de configuración remota eliminado');
    return;
  }

  // Validar URL remota
  if (options.validate && options.url) {
    console.log(`🔍 Validando URL: ${options.url}`);
    const result = await loader.validateUrl(options.url);
    
    if (result.valid) {
      console.log('✅ URL accesible y configuración válida');
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
    return;
  }

  // Descargar configuración remota
  if (options.pull || options.url || options.github) {
    let remoteUrl: string;

    if (options.github) {
      try {
        remoteUrl = RemoteConfigLoader.githubToRaw(
          options.github,
          options.branch || 'main',
          options.file || 'heartbeat.config.json'
        );
        if (options.verbose) {
          console.log(`📥 URL generada: ${remoteUrl}`);
        }
      } catch (error) {
        console.log(`❌ Error: ${error instanceof Error ? error.message : 'URL de GitHub inválida'}`);
        return;
      }
    } else if (options.url) {
      remoteUrl = options.url;
    } else {
      // Buscar URL en configuración local
      if (!fs.existsSync(configPath)) {
        console.log('❌ No existe archivo de configuración local');
        console.log('💡 Usa --url o --github para especificar fuente remota');
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as any;
      if (!localConfig.remote?.url) {
        console.log('❌ No hay URL remota configurada');
        console.log('💡 Usa --url o --github para especificar fuente remota');
        return;
      }
      remoteUrl = localConfig.remote.url;
    }

    console.log(`📥 Descargando configuración desde: ${remoteUrl}`);

    try {
      const result = await loader.loadWithCache(remoteUrl);
      
      console.log(`✅ Configuración cargada (${result.source})`);
      
      if (result.cachedAt) {
        console.log(`   Cacheado: ${result.cachedAt.toISOString()}`);
      }

      if (options.verbose) {
        console.log('\n📋 Configuración:');
        console.log(JSON.stringify(result.config, null, 2));
      }

      // Si merge está activo, mezclar con config local
      if (options.merge && fs.existsSync(configPath)) {
        const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Partial<HeartbeatConfig>;
        const merged = loader.mergeConfigs(result.config, localConfig);
        
        if (options.verbose) {
          console.log('\n🔀 Configuración mezclada:');
          console.log(JSON.stringify(merged, null, 2));
        }
        
        // Guardar configuración mezclada
        fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));
        console.log('✅ Configuración remota mezclada con local');
        return;
      }

      // Guardar configuración remota como local
      if (options.pull) {
        // Preservar configuración remota en metadata
        const configToSave = {
          ...result.config,
          remote: {
            url: remoteUrl,
            lastSync: new Date().toISOString()
          }
        };
        
        fs.writeFileSync(configPath, JSON.stringify(configToSave, null, 2));
        console.log('✅ Configuración guardada en heartbeat.config.json');
      }

    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      console.log('\n💡 Sugerencias:');
      console.log('   - Verifica que la URL sea accesible');
      console.log('   - Usa --cache para usar caché si está disponible');
      console.log('   - Usa --verbose para más detalles');
    }
    return;
  }

  // Gestionar caché
  if (options.cache) {
    const cacheFile = path.resolve(process.cwd(), '.heartbeat/cache/remote-config.json');
    
    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      console.log('📦 Caché de configuración remota:');
      console.log(`   URL: ${cached.url}`);
      console.log(`   Cacheado: ${cached.cachedAt}`);
      
      if (options.verbose) {
        console.log('\n📋 Configuración:');
        console.log(JSON.stringify(cached.config, null, 2));
      }
    } else {
      console.log('ℹ️  No hay caché de configuración remota');
    }
    return;
  }

  // Push (no implementado aún - requeriría autenticación)
  if (options.push) {
    console.log('⚠️  Push de configuración no implementado aún');
    console.log('💡 Por ahora, usa git push para sincronizar cambios');
    return;
  }

  // Sin opciones - mostrar ayuda
  console.log('📡 Configuración Remota');
  console.log('');
  console.log('Uso:');
  console.log('  heartbeat remote --url <url>           Descarga configuración desde URL');
  console.log('  heartbeat remote --github <repo>        Descarga desde repositorio GitHub');
  console.log('  heartbeat remote --pull                 Descarga y guarda localmente');
  console.log('  heartbeat remote --merge                Mezcla remota con local');
  console.log('  heartbeat remote --cache                Muestra caché actual');
  console.log('  heartbeat remote --clear-cache          Limpia el caché');
  console.log('  heartbeat remote --validate --url <url> Valida URL remota');
  console.log('');
  console.log('Opciones:');
  console.log('  --url <url>      URL de configuración remota');
  console.log('  --github <repo>  Repositorio GitHub (owner/repo)');
  console.log('  --branch <name>  Branch de GitHub (default: main)');
  console.log('  --file <path>    Archivo en repo (default: heartbeat.config.json)');
  console.log('  --pull           Guardar configuración remota localmente');
  console.log('  --merge          Mezclar configuración remota con local');
  console.log('  --cache          Mostrar configuración en caché');
  console.log('  --clear-cache    Limpiar caché');
  console.log('  --validate       Validar URL de configuración');
  console.log('  --verbose        Mostrar información detallada');
  console.log('');
  console.log('Ejemplos:');
  console.log('  heartbeat remote --github luminexo/ollama-heartbeat-tools');
  console.log('  heartbeat remote --url https://example.com/config.json --pull');
  console.log('  heartbeat remote --github my/repo --branch develop --file config/heartbeat.json');
}