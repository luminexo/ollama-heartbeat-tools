import { execSync } from 'child_process';
import http from 'http';
import https from 'https';
import {
  OllamaModel,
  OllamaGenerateRequest,
  OllamaGenerateResponse,
  OllamaClientConfig,
  OllamaStatus
} from './types';

const DEFAULT_CONFIG: OllamaClientConfig = {
  baseUrl: 'http://localhost:11434',
  timeout: 60000,
  maxRetries: 3
};

export class OllamaClient {
  private config: OllamaClientConfig;

  constructor(config: Partial<OllamaClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detecta si Ollama está instalado en el sistema
   */
  static isOllamaInstalled(): boolean {
    try {
      execSync('which ollama', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Verifica si el servidor Ollama está corriendo
   */
  async isServerRunning(): Promise<boolean> {
    try {
      const response = await this.request('GET', '/api/tags');
      return response !== null;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el estado completo de Ollama
   */
  async getStatus(): Promise<OllamaStatus> {
    const installed = OllamaClient.isOllamaInstalled();
    
    if (!installed) {
      return {
        available: false,
        models: [],
        error: 'Ollama no está instalado'
      };
    }

    const running = await this.isServerRunning();
    
    if (!running) {
      return {
        available: false,
        models: [],
        error: 'El servidor Ollama no está corriendo. Ejecuta "ollama serve"'
      };
    }

    try {
      const models = await this.listModels();
      return {
        available: true,
        models,
        error: undefined
      };
    } catch (error) {
      return {
        available: false,
        models: [],
        error: `Error al obtener modelos: ${error}`
      };
    }
  }

  /**
   * Lista todos los modelos disponibles en Ollama
   */
  async listModels(): Promise<OllamaModel[]> {
    const response = await this.request('GET', '/api/tags') as { models?: OllamaModel[] } | null;
    if (!response || !response.models) {
      return [];
    }
    return response.models;
  }

  /**
   * Genera una respuesta usando el modelo especificado
   */
  async generate(
    prompt: string,
    model: string,
    options: Partial<OllamaGenerateRequest> = {}
  ): Promise<OllamaGenerateResponse> {
    const request: OllamaGenerateRequest = {
      model,
      prompt,
      stream: false,
      ...options
    };

    const response = await this.request('POST', '/api/generate', request);
    return response as OllamaGenerateResponse;
  }

  /**
   * Genera una respuesta simple (solo el texto)
   */
  async ask(prompt: string, model: string = 'llama3'): Promise<string> {
    try {
      const response = await this.generate(prompt, model);
      return response.response || '';
    } catch (error) {
      throw new Error(`Error al generar respuesta: ${error}`);
    }
  }

  /**
   * Realiza una petición HTTP al servidor Ollama
   */
  private async request(
    method: string,
    path: string,
    body?: unknown
  ): Promise<unknown | null> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.config.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: this.config.timeout
      };

      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (data) {
              resolve(JSON.parse(data));
            } else {
              resolve(null);
            }
          } catch {
            resolve(data || null);
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  /**
   * Formatea bytes a una cadena legible
   */
  static formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unit = 0;
    while (bytes >= 1024 && unit < units.length - 1) {
      bytes /= 1024;
      unit++;
    }
    return `${bytes.toFixed(1)} ${units[unit]}`;
  }

  /**
   * Formatea el tiempo de respuesta en formato legible
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  }
}

export default OllamaClient;