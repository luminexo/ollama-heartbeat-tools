import { statusCommand } from '../commands/status';
import fs from 'fs';
import { execSync } from 'child_process';

// Mock dependencies
jest.mock('fs');
jest.mock('child_process');

describe('status command', () => {
  const mockReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;
  const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
  const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.cwd
    process.cwd = jest.fn(() => '/test/project');
  });

  it('should display status when config exists', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockImplementation((path: any) => {
      if (path.includes('heartbeat.config.json')) {
        return JSON.stringify({
          name: 'test-project',
          version: '1.0.0',
          ollama: { enabled: true, model: 'llama3' },
        });
      }
      if (path.includes('HEARTBEAT_COUNTER.md')) {
        return '**Contador:** 5\n## Historial';
      }
      return '';
    });
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd.includes('branch')) return 'main';
      if (cmd.includes('status --porcelain')) return '';
      return '';
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    statusCommand({ json: false });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('test-project')
    );
    
    consoleSpy.mockRestore();
  });

  it('should output JSON when json flag is set', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockImplementation((path: any) => {
      if (path.includes('heartbeat.config.json')) {
        return JSON.stringify({
          name: 'json-project',
          version: '2.0.0',
          ollama: { enabled: false, model: 'none' },
        });
      }
      if (path.includes('HEARTBEAT_COUNTER.md')) {
        return '**Contador:** 10\n## Historial';
      }
      return '';
    });
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd.includes('branch')) return 'develop';
      if (cmd.includes('status --porcelain')) return 'M file.ts';
      return '';
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    statusCommand({ json: true });

    const output = consoleSpy.mock.calls.map(c => c.join('')).join('\n');
    const parsed = JSON.parse(output);
    
    expect(parsed.name).toBe('json-project');
    expect(parsed.version).toBe('2.0.0');
    expect(parsed.heartbeatCount).toBe(10);
    
    consoleSpy.mockRestore();
  });

  it('should warn when no config file found', () => {
    mockExistsSync.mockReturnValue(false);

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    statusCommand({ json: false });

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('No se encontró')
    );
    
    consoleSpy.mockRestore();
  });

  it('should detect git repository status', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockImplementation((path: any) => {
      if (path.includes('heartbeat.config.json')) {
        return JSON.stringify({
          name: 'git-project',
          version: '1.0.0',
        });
      }
      if (path.includes('HEARTBEAT_COUNTER.md')) {
        return '**Contador:** 1';
      }
      return '';
    });
    mockExecSync.mockImplementation((cmd: string) => {
      if (cmd.includes('branch')) return 'feature/test';
      if (cmd.includes('status --porcelain')) return '?? newfile.ts';
      return '';
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    statusCommand({ json: false });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('feature/test'));
    
    consoleSpy.mockRestore();
  });
});