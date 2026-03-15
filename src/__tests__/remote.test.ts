import { RemoteConfigLoader } from '../config/remote';
import fs from 'fs';
import path from 'path';

// Mock de fs
jest.mock('fs');

describe('RemoteConfigLoader', () => {
  let loader: RemoteConfigLoader;

  beforeEach(() => {
    loader = new RemoteConfigLoader();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('debe usar valores por defecto', () => {
      const defaultLoader = new RemoteConfigLoader();
      expect(defaultLoader).toBeDefined();
    });

    it('debe aceptar opciones personalizadas', () => {
      const customLoader = new RemoteConfigLoader({
        timeout: 5000,
        retries: 5,
        cachePath: '.custom/cache.json'
      });
      expect(customLoader).toBeDefined();
    });
  });

  describe('githubToRaw', () => {
    it('debe convertir URL de GitHub a raw', () => {
      const url = RemoteConfigLoader.githubToRaw('https://github.com/owner/repo');
      expect(url).toBe('https://raw.githubusercontent.com/owner/repo/main/heartbeat.config.json');
    });

    it('debe aceptar branch personalizado', () => {
      const url = RemoteConfigLoader.githubToRaw('https://github.com/owner/repo', 'develop');
      expect(url).toBe('https://raw.githubusercontent.com/owner/repo/develop/heartbeat.config.json');
    });

    it('debe aceptar archivo personalizado', () => {
      const url = RemoteConfigLoader.githubToRaw(
        'https://github.com/owner/repo',
        'main',
        'config/custom.json'
      );
      expect(url).toBe('https://raw.githubusercontent.com/owner/repo/main/config/custom.json');
    });

    it('debe lanzar error para URL inválida', () => {
      expect(() => {
        RemoteConfigLoader.githubToRaw('https://invalid-url.com');
      }).toThrow('URL de GitHub inválida');
    });
  });

  describe('mergeConfigs', () => {
    const remoteConfig = {
      name: 'remote-project',
      version: '1.0.0',
      heartbeat: {
        interval: 300000,
        maxRetries: 3,
        timeout: 30000
      },
      ollama: {
        enabled: true,
        baseUrl: 'http://localhost:11434',
        model: 'llama3'
      },
      logging: {
        level: 'info',
        file: 'heartbeat.log'
      }
    };

    it('debe mezclar configs dando prioridad a valores locales', () => {
      const localConfig = {
        name: 'local-project',
        ollama: {
          enabled: true,
          baseUrl: 'http://localhost:11434',
          model: 'mistral'
        }
      };

      const merged = loader.mergeConfigs(remoteConfig, localConfig);

      expect(merged.name).toBe('local-project'); // Local tiene prioridad
      expect(merged.ollama.model).toBe('mistral'); // Local tiene prioridad
      expect(merged.ollama.baseUrl).toBe('http://localhost:11434'); // Del remote
    });

    it('debe usar valores remotos si no hay locales', () => {
      const merged = loader.mergeConfigs(remoteConfig, {});
      expect(merged).toEqual(remoteConfig);
    });

    it('debe hacer merge profundo de objetos anidados', () => {
      const localConfig = {
        heartbeat: {
          interval: 60000,
          maxRetries: 3,
          timeout: 30000
        },
        logging: {
          level: 'debug',
          file: 'heartbeat.log'
        }
      };

      const merged = loader.mergeConfigs(remoteConfig, localConfig);

      expect(merged.heartbeat.interval).toBe(60000); // Local
      expect(merged.heartbeat.maxRetries).toBe(3); // Remote
      expect(merged.logging.level).toBe('debug'); // Local
      expect(merged.logging.file).toBe('heartbeat.log'); // Remote
    });
  });

  describe('clearCache', () => {
    it('debe eliminar caché si existe', () => {
      const unlinkSpy = jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      const rmSyncSpy = jest.spyOn(fs, 'unlinkSync').mockImplementation();

      loader.clearCache();

      expect(rmSyncSpy).toHaveBeenCalled();
      unlinkSpy.mockRestore();
      rmSyncSpy.mockRestore();
    });

    it('no debe fallar si el caché no existe', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      expect(() => loader.clearCache()).not.toThrow();
    });
  });

  describe('validateUrl', () => {
    it('debe rechazar URLs no HTTP', async () => {
      const result = await loader.validateUrl('ftp://example.com/config.json');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HTTP');
    });

    it('debe rechazar URLs inválidas', async () => {
      const result = await loader.validateUrl('not-a-url');
      expect(result.valid).toBe(false);
    });
  });
});