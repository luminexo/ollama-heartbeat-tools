import fs from 'fs';
import path from 'path';
import { RemoteConfigLoader } from '../config/remote';
import { HeartbeatConfig } from '../index';
import { logger } from '../logger';

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
    logger.success('Caché de configuración remota eliminado');
    return;
  }

  // Validar URL remota
  if (options.validate && options.url) {
    logger.info(`🔍 Validando URL: ${options.url}`);
    const result = await loader.validateUrl(options.url);
    
    if (result.valid) {
      logger.success('URL accesible y configuración válida');
    } else {
      logger.error(`Error: ${result.error}`);
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
          logger.debug(`📥 URL generada: ${remoteUrl}`);
        }
      } catch (error) {
        logger.error(`Error: ${error instanceof Error ? error.message : 'URL de GitHub inválida'}`);
        return;
      }
    } else if (options.url) {
      remoteUrl = options.url;
    } else {
      // Buscar URL en configuración local
      if (!fs.existsSync(configPath)) {
        logger.error('No existe archivo de configuración local');
        logger.info('💡 Usa --url o --github para especificar fuente remota');
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as any;
      if (!localConfig.remote?.url) {
        logger.error('No hay URL remota configurada');
        logger.info('💡 Usa --url o --github para especificar fuente remota');
        return;
      }
      remoteUrl = localConfig.remote.url;
    }

    logger.info(`📥 Descargando configuración desde: ${remoteUrl}`);

    try {
      const result = await loader.loadWithCache(remoteUrl);
      
      logger.success(`Configuración cargada (${result.source})`);
      
      if (result.cachedAt) {
        logger.debug(`   Cacheado: ${result.cachedAt.toISOString()}`);
      }

      if (options.verbose) {
        logger.info('📋 Configuración:');
        console.log(JSON.stringify(result.config, null, 2));
      }

      // Si merge está activo, mezclar con config local
      if (options.merge && fs.existsSync(configPath)) {
        const localConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Partial<HeartbeatConfig>;
        const merged = loader.mergeConfigs(result.config, localConfig);
        
        if (options.verbose) {
          logger.info('🔀 Configuración mezclada:');
          console.log(JSON.stringify(merged, null, 2));
        }
        
        // Guardar configuración mezclada
        fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));
        logger.success('Configuración remota mezclada con local');
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
        logger.success('Configuración guardada en heartbeat.config.json');
      }

    } catch (error) {
      logger.error(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      logger.info('💡 Sugerencias:');
      logger.info('   - Verifica que la URL sea accesible');
      logger.info('   - Usa --cache para usar caché si está disponible');
      logger.info('   - Usa --verbose para más detalles');
    }
    return;
  }

  // Gestionar caché
  if (options.cache) {
    const cacheFile = path.resolve(process.cwd(), '.heartbeat/cache/remote-config.json');
    
    if (fs.existsSync(cacheFile)) {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
      logger.info('📦 Caché de configuración remota:');
      logger.info(`   URL: ${cached.url}`);
      logger.info(`   Cacheado: ${cached.cachedAt}`);
      
      if (options.verbose) {
        logger.info('📋 Configuración:');
        console.log(JSON.stringify(cached.config, null, 2));
      }
    } else {
      logger.info('ℹ️  No hay caché de configuración remota');
    }
    return;
  }

  // Push (no implementado aún - requeriría autenticación)
  if (options.push) {
    logger.warn('⚠️  Push de configuración no implementado aún');
    logger.info('💡 Por ahora, usa git push para sincronizar cambios');
    return;
  }

  // Sin opciones - mostrar ayuda
  logger.info('📡 Configuración Remota');
  logger.info('');
  logger.info('Uso:');
  logger.info('  heartbeat remote --url <url>           Descarga configuración desde URL');
  logger.info('  heartbeat remote --github <repo>        Descarga desde repositorio GitHub');
  logger.info('  heartbeat remote --pull                 Descarga y guarda localmente');
  logger.info('  heartbeat remote --merge                Mezcla remota con local');
  logger.info('  heartbeat remote --cache                Muestra caché actual');
  logger.info('  heartbeat remote --clear-cache          Limpia el caché');
  logger.info('  heartbeat remote --validate --url <url> Valida URL remota');
  logger.info('');
  logger.info('Opciones:');
  logger.info('  --url <url>      URL de configuración remota');
  logger.info('  --github <repo>  Repositorio GitHub (owner/repo)');
  logger.info('  --branch <name>  Branch de GitHub (default: main)');
  logger.info('  --file <path>    Archivo en repo (default: heartbeat.config.json)');
  logger.info('  --pull           Guardar configuración remota localmente');
  logger.info('  --merge          Mezclar configuración remota con local');
  logger.info('  --cache          Mostrar configuración en caché');
  logger.info('  --clear-cache    Limpiar caché');
  logger.info('  --validate       Validar URL de configuración');
  logger.info('  --verbose        Mostrar información detallada');
  logger.info('');
  logger.info('Ejemplos:');
  logger.info('  heartbeat remote --github luminexo/ollama-heartbeat-tools');
  logger.info('  heartbeat remote --url https://example.com/config.json --pull');
  logger.info('  heartbeat remote --github my/repo --branch develop --file config/heartbeat.json');
}