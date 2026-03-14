import { OllamaClient } from '../ollama/client';

describe('OllamaClient', () => {
  describe('isOllamaInstalled', () => {
    it('should return boolean', () => {
      const result = OllamaClient.isOllamaInstalled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(OllamaClient.formatBytes(0)).toBe('0.0 B');
      expect(OllamaClient.formatBytes(1024)).toBe('1.0 KB');
      expect(OllamaClient.formatBytes(1048576)).toBe('1.0 MB');
      expect(OllamaClient.formatBytes(1073741824)).toBe('1.0 GB');
    });
  });

  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(OllamaClient.formatDuration(100)).toBe('100ms');
      expect(OllamaClient.formatDuration(1500)).toBe('1.5s');
      expect(OllamaClient.formatDuration(90000)).toBe('1.5min');
    });
  });

  describe('constructor', () => {
    it('should create client with default config', () => {
      const client = new OllamaClient();
      expect(client).toBeDefined();
    });

    it('should accept custom config', () => {
      const client = new OllamaClient({
        baseUrl: 'http://custom:11434',
        timeout: 30000
      });
      expect(client).toBeDefined();
    });
  });
});