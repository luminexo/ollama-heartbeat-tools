import { initCommand } from '../commands/init';
import fs from 'fs';
import path from 'path';

// Mock fs module
jest.mock('fs');

describe('init command', () => {
  const mockMkdirSync = fs.mkdirSync as jest.MockedFunction<typeof fs.mkdirSync>;
  const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;
  const mockExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockMkdirSync.mockImplementation(() => undefined as any);
    mockWriteFileSync.mockImplementation(() => undefined);
  });

  it('should create project directory structure', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    initCommand('test-project', { template: 'default', directory: '/tmp' });

    expect(mockMkdirSync).toHaveBeenCalled();
    expect(mockWriteFileSync).toHaveBeenCalledTimes(3);
    
    consoleSpy.mockRestore();
  });

  it('should create heartbeat.config.json', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    initCommand('my-project', { template: 'default', directory: '.' });

    const configCall = mockWriteFileSync.mock.calls.find(
      call => call[0].toString().includes('heartbeat.config.json')
    );
    
    expect(configCall).toBeDefined();
    const configContent = JSON.parse(configCall![1] as string);
    expect(configContent.name).toBe('my-project');
    expect(configContent.heartbeat.interval).toBe(300000);
    expect(configContent.ollama.enabled).toBe(true);
    
    consoleSpy.mockRestore();
  });

  it('should create GOALS.md with project name', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    initCommand('awesome-project', { template: 'default', directory: '.' });

    const goalsCall = mockWriteFileSync.mock.calls.find(
      call => call[0].toString().includes('GOALS.md')
    );
    
    expect(goalsCall).toBeDefined();
    expect((goalsCall![1] as string).includes('awesome-project')).toBe(true);
    
    consoleSpy.mockRestore();
  });

  it('should use default name when not provided', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    initCommand('', { template: 'default', directory: '.' });

    // When name is empty, it defaults to 'heartbeat-project' in the function
    const configCall = mockWriteFileSync.mock.calls.find(
      call => call[0].toString().includes('heartbeat.config.json')
    );
    const configContent = JSON.parse(configCall![1] as string);
    expect(configContent.name).toBe('heartbeat-project');
    
    consoleSpy.mockRestore();
  });
});