import { validateCommand } from '../commands/validate';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Mock console.log and process.exit
const mockLog = jest.spyOn(console, 'log').mockImplementation();
const mockExit = jest.spyOn(process, 'exit').mockImplementation();

describe('validateCommand', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heartbeat-validate-test-'));
    mockLog.mockClear();
    mockExit.mockClear();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('debe reportar error si heartbeat.config.json no existe', () => {
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('heartbeat.config.json'));
    
    process.chdir(originalCwd);
  });

  it('debe validar heartbeat.config.json válido', () => {
    const validConfig = {
      name: 'test-project',
      version: '1.0.0',
      heartbeat: {
        interval: 30000,
        maxRetries: 3,
        timeout: 5000
      },
      ollama: {
        enabled: true,
        baseUrl: 'http://localhost:11434',
        model: 'llama3'
      }
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      JSON.stringify(validConfig, null, 2)
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockExit).not.toHaveBeenCalledWith(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Validación completada'));
    
    process.chdir(originalCwd);
  });

  it('debe reportar error si config tiene JSON inválido', () => {
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      '{ invalid json }'
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Error de sintaxis JSON'));
    
    process.chdir(originalCwd);
  });

  it('debe reportar error si falta campo name', () => {
    const invalidConfig = {
      version: '1.0.0'
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      JSON.stringify(invalidConfig, null, 2)
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('name'));
    
    process.chdir(originalCwd);
  });

  it('debe advertir si Ollama habilitado sin modelo', () => {
    const configWithoutModel = {
      name: 'test-project',
      version: '1.0.0',
      ollama: {
        enabled: true
      }
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      JSON.stringify(configWithoutModel, null, 2)
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Ollama habilitado pero sin modelo'));
    
    process.chdir(originalCwd);
  });

  it('debe reportar error si URL de Ollama es inválida', () => {
    const invalidUrlConfig = {
      name: 'test-project',
      version: '1.0.0',
      ollama: {
        enabled: true,
        baseUrl: 'not-a-valid-url',
        model: 'llama3'
      }
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      JSON.stringify(invalidUrlConfig, null, 2)
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('URL de Ollama inválida'));
    
    process.chdir(originalCwd);
  });

  it('debe advertir si GOALS.md no tiene objetivos', () => {
    const validConfig = {
      name: 'test-project',
      version: '1.0.0'
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      JSON.stringify(validConfig, null, 2)
    );
    
    fs.writeFileSync(
      path.join(tempDir, 'GOALS.md'),
      'Este es un archivo sin objetivos'
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('No se encontraron objetivos'));
    
    process.chdir(originalCwd);
  });

  it('debe validar HEARTBEAT_COUNTER.md correctamente', () => {
    const validConfig = {
      name: 'test-project',
      version: '1.0.0'
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      JSON.stringify(validConfig, null, 2)
    );
    
    fs.writeFileSync(
      path.join(tempDir, 'HEARTBEAT_COUNTER.md'),
      '# Contador\n\n**Contador:** 5\n\nHistorial aquí.'
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockExit).not.toHaveBeenCalledWith(1);
    
    process.chdir(originalCwd);
  });

  it('debe reportar error si contador tiene formato inválido', () => {
    const validConfig = {
      name: 'test-project',
      version: '1.0.0'
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      JSON.stringify(validConfig, null, 2)
    );
    
    fs.writeFileSync(
      path.join(tempDir, 'HEARTBEAT_COUNTER.md'),
      '# Contador\n\nContador: cinco\n\nHistorial aquí.'
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: false, fix: false });
    
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Formato de contador inválido'));
    
    process.chdir(originalCwd);
  });

  it('debe mostrar información detallada con verbose', () => {
    const validConfig = {
      name: 'test-project',
      version: '1.0.0',
      heartbeat: {
        interval: 30000
      }
    };
    
    fs.writeFileSync(
      path.join(tempDir, 'heartbeat.config.json'),
      JSON.stringify(validConfig, null, 2)
    );
    
    const originalCwd = process.cwd();
    process.chdir(tempDir);
    
    validateCommand({ verbose: true, fix: false });
    
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Resumen'));
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Archivos verificados'));
    
    process.chdir(originalCwd);
  });
});