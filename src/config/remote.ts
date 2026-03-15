import https from 'https';
import http from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { HeartbeatConfig } from '../index';

export interface RemoteConfigOptions {
  timeout?: number;
  retries?: number;
  cachePath?: string;
}

export interface RemoteConfigResult {
  config: HeartbeatConfig;
  source: 'remote' | 'cached' | 'local';
  cachedAt?: Date;
}

/**
 * Gestiona la carga de configuración desde fuentes remotas
 */
export class RemoteConfigLoader {
  private timeout: number;
  private retries: number;
  private cachePath: string;

  constructor(options: RemoteConfigOptions = {}) {
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.cachePath = options.cachePath || '.heartbeat/cache/remote-config.json';
  }

  /**
   * Carga configuración desde una URL remota
   */
  async loadFromUrl(url: string): Promise<HeartbeatConfig> {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Timeout loading config from ${url}`));
      }, this.timeout);

      protocol.get(url, (res) => {
        clearTimeout(timeoutId);

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: Failed to load config from ${url}`));
          return;
        }

        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const config = JSON.parse(data) as HeartbeatConfig;
            resolve(config);
          } catch (error) {
            reject(new Error(`Invalid JSON in remote config: ${error}`));
          }
        });
      }).on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  /**
   * Carga configuración remota con caching
   */
  async loadWithCache(url: string): Promise<RemoteConfigResult> {
    const cacheFile = path.resolve(process.cwd(), this.cachePath);

    // Intentar cargar desde caché primero
    if (fs.existsSync(cacheFile)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        const cachedAt = new Date(cached.cachedAt);
        
        // Verificar si el caché es reciente (menos de 1 hora)
        const cacheAge = Date.now() - cachedAt.getTime();
        const maxAge = 60 * 60 * 1000; // 1 hora

        if (cacheAge < maxAge && cached.config) {
          return {
            config: cached.config,
            source: 'cached',
            cachedAt
          };
        }
      } catch {
        // Caché inválido, continuar con carga remota
      }
    }

    // Cargar desde URL remota
    try {
      const config = await this.loadFromUrl(url);
      
      // Guardar en caché
      const cacheDir = path.dirname(cacheFile);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      
      fs.writeFileSync(cacheFile, JSON.stringify({
        url,
        config,
        cachedAt: new Date().toISOString()
      }, null, 2));

      return {
        config,
        source: 'remote'
      };
    } catch (error) {
      // Si falla, intentar usar caché aunque sea antiguo
      if (fs.existsSync(cacheFile)) {
        const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
        return {
          config: cached.config,
          source: 'cached',
          cachedAt: new Date(cached.cachedAt)
        };
      }
      throw error;
    }
  }

  /**
   * Mezcla configuración remota con configuración local
   * Los valores locales tienen prioridad sobre los remotos
   */
  mergeConfigs(remoteConfig: HeartbeatConfig, localConfig: Partial<HeartbeatConfig>): HeartbeatConfig {
    return {
      name: localConfig.name || remoteConfig.name,
      version: localConfig.version || remoteConfig.version,
      heartbeat: {
        ...remoteConfig.heartbeat,
        ...localConfig.heartbeat
      },
      ollama: {
        ...remoteConfig.ollama,
        ...localConfig.ollama
      },
      logging: {
        ...remoteConfig.logging,
        ...localConfig.logging
      }
    };
  }

  /**
   * Valida que una URL de configuración remota sea accesible
   */
  async validateUrl(url: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const parsedUrl = new URL(url);
      
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return { valid: false, error: 'URL debe ser HTTP o HTTPS' };
      }

      await this.loadFromUrl(url);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'URL no accesible'
      };
    }
  }

  /**
   * Genera URL raw de GitHub desde URL de repositorio
   */
  static githubToRaw(githubUrl: string, branch: string = 'main', filePath: string = 'heartbeat.config.json'): string {
    // Parsear URL de GitHub
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error('URL de GitHub inválida');
    }

    const [, owner, repo] = match;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  }

  /**
   * Limpia el caché de configuración remota
   */
  clearCache(): void {
    const cacheFile = path.resolve(process.cwd(), this.cachePath);
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile);
    }
  }
}

/**
 * Formatea bytes a formato legible
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}