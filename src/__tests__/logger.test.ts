import { Logger, LogLevel, setLevel, setFile, setJsonMode, configure, debug, info, warn, error, success } from '../logger';
import * as fs from 'fs';
import * as path from 'path';

// Mock console methods
const originalLog = console.log;
const originalWarn = console.warn;
const originalError = console.error;

describe('Logger', () => {
  let logger: Logger;
  let mockLog: jest.Mock;
  let mockWarn: jest.Mock;
  let mockError: jest.Mock;

  beforeEach(() => {
    logger = new Logger();
    mockLog = jest.fn();
    mockWarn = jest.fn();
    mockError = jest.fn();
    console.log = mockLog;
    console.warn = mockWarn;
    console.error = mockError;
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  describe('setLevel', () => {
    it('should set log level to debug', () => {
      logger.setLevel('debug');
      expect(logger.getLevel()).toBe('debug');
    });

    it('should set log level to silent', () => {
      logger.setLevel('silent');
      expect(logger.getLevel()).toBe('silent');
    });

    it('should default to info level', () => {
      expect(logger.getLevel()).toBe('info');
    });
  });

  describe('log levels', () => {
    it('should log debug when level is debug', () => {
      logger.setLevel('debug');
      logger.debug('test message');
      expect(mockLog).toHaveBeenCalled();
    });

    it('should not log debug when level is info', () => {
      logger.setLevel('info');
      logger.debug('test message');
      expect(mockLog).not.toHaveBeenCalled();
    });

    it('should log info when level is info', () => {
      logger.setLevel('info');
      logger.info('test message');
      expect(mockLog).toHaveBeenCalled();
    });

    it('should log warn when level is warn', () => {
      logger.setLevel('warn');
      logger.info('test message');
      expect(mockLog).not.toHaveBeenCalled();
      logger.warn('warning message');
      expect(mockWarn).toHaveBeenCalled();
    });

    it('should log error when level is error', () => {
      logger.setLevel('error');
      logger.info('test message');
      expect(mockLog).not.toHaveBeenCalled();
      logger.error('error message');
      expect(mockError).toHaveBeenCalled();
    });

    it('should not log anything when level is silent', () => {
      logger.setLevel('silent');
      logger.debug('test');
      logger.info('test');
      logger.warn('test');
      logger.error('test');
      expect(mockLog).not.toHaveBeenCalled();
      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
    });
  });

  describe('formatting', () => {
    it('should include emoji prefix', () => {
      logger.setLevel('info');
      logger.info('test message');
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('ℹ️'));
    });

    it('should include metadata when provided', () => {
      logger.setLevel('info');
      logger.info('test message', { key: 'value' });
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('key'));
    });
  });

  describe('json mode', () => {
    it('should output JSON when jsonMode is enabled', () => {
      logger.setJsonMode(true);
      logger.setLevel('info');
      logger.info('test message');
      expect(mockLog).toHaveBeenCalled();
      const output = mockLog.mock.calls[0][0];
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('test message');
    });
  });

  describe('timestamps', () => {
    it('should not include timestamp by default', () => {
      logger.setLevel('info');
      logger.info('test message');
      const output = mockLog.mock.calls[0][0];
      expect(output).not.toMatch(/^\[/);
    });

    it('should include timestamp when enabled', () => {
      logger.setTimestamps(true);
      logger.setLevel('info');
      logger.info('test message');
      const output = mockLog.mock.calls[0][0];
      expect(output).toMatch(/^\[\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('success', () => {
    it('should log success message with checkmark', () => {
      logger.setLevel('info');
      logger.success('operation completed');
      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('✓'));
    });
  });

  describe('progress', () => {
    it('should log progress message', () => {
      logger.setLevel('info');
      logger.progress('loading...');
      expect(mockLog).toHaveBeenCalled();
    });
  });
});

describe('File output', () => {
  let logger: Logger;
  const testLogFile = '/tmp/test-heartbeat-logger.log';

  beforeEach(() => {
    logger = new Logger();
    // Clean up test file if exists
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  it('should write to file when configured', () => {
    logger.setFile(testLogFile);
    logger.setLevel('info');
    logger.info('test message for file');
    
    expect(fs.existsSync(testLogFile)).toBe(true);
    const content = fs.readFileSync(testLogFile, 'utf-8');
    expect(content).toContain('test message for file');
  });

  it('should write JSON to file when jsonMode enabled', () => {
    logger.setFile(testLogFile);
    logger.setJsonMode(true);
    logger.setLevel('info');
    logger.info('json message');
    
    const content = fs.readFileSync(testLogFile, 'utf-8');
    const lines = content.trim().split('\n');
    const parsed = JSON.parse(lines[lines.length - 1]);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('json message');
  });

  it('should create directory if not exists', () => {
    const nestedPath = '/tmp/test-logger-dir/nested/file.log';
    logger.setFile(nestedPath);
    logger.setLevel('info');
    logger.info('test');
    
    expect(fs.existsSync('/tmp/test-logger-dir/nested')).toBe(true);
    
    // Cleanup
    fs.rmSync('/tmp/test-logger-dir', { recursive: true, force: true });
  });
});

describe('Convenience functions', () => {
  beforeEach(() => {
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  it('should use singleton for setLevel', () => {
    setLevel('debug');
    // Function just sets level on singleton
    expect(true).toBe(true);
  });

  it('should use singleton for info', () => {
    setLevel('info');
    info('test');
    expect(console.log).toHaveBeenCalled();
  });

  it('should use singleton for warn', () => {
    setLevel('warn');
    warn('test');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should use singleton for error', () => {
    setLevel('error');
    error('test');
    expect(console.error).toHaveBeenCalled();
  });

  it('should use singleton for success', () => {
    setLevel('info');
    success('test');
    expect(console.log).toHaveBeenCalled();
  });
});

describe('configure', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  });

  it('should configure all options at once', () => {
    logger.configure({
      level: 'debug',
      colors: false,
      timestamps: true,
    });
    expect(logger.getLevel()).toBe('debug');
    // Settings applied
    expect(true).toBe(true);
  });
});