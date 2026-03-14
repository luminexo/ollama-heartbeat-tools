import { generateProject, getAvailableTemplates, getTemplateInfo } from '../templates/generator';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('Templates Module', () => {
  describe('getAvailableTemplates', () => {
    it('should return list of available templates', () => {
      const templates = getAvailableTemplates();
      expect(templates).toContain('default');
      expect(templates).toContain('nodejs');
      expect(templates).toContain('python');
      expect(templates).toContain('luminexo');
      expect(templates.length).toBe(4);
    });
  });

  describe('getTemplateInfo', () => {
    it('should return info for valid template', () => {
      const info = getTemplateInfo('default');
      expect(info).not.toBeNull();
      expect(info?.name).toBe('default');
      expect(info?.description).toContain('genérica');
    });

    it('should return null for invalid template', () => {
      const info = getTemplateInfo('nonexistent');
      expect(info).toBeNull();
    });

    it('should return correct info for nodejs template', () => {
      const info = getTemplateInfo('nodejs');
      expect(info?.name).toBe('nodejs');
      expect(info?.description).toContain('Node.js');
    });

    it('should return correct info for python template', () => {
      const info = getTemplateInfo('python');
      expect(info?.name).toBe('python');
      expect(info?.description).toContain('Python');
    });

    it('should return correct info for luminexo template', () => {
      const info = getTemplateInfo('luminexo');
      expect(info?.name).toBe('luminexo');
      expect(info?.description).toContain('Luminexo');
    });
  });

  describe('generateProject', () => {
    let tempDir: string;

    beforeEach(() => {
      tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'heartbeat-test-'));
    });

    afterEach(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    it('should generate default template project', () => {
      const result = generateProject('test-project', 'default', tempDir);
      
      expect(result.success).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.files).toContain('heartbeat.config.json');
      expect(result.files).toContain('GOALS.md');
      expect(result.files).toContain('HEARTBEAT_COUNTER.md');
    });

    it('should generate nodejs template project', () => {
      const result = generateProject('test-nodejs', 'nodejs', tempDir);
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('package.json');
      expect(result.files).toContain('tsconfig.json');
      expect(result.files).toContain('src/index.ts');
    });

    it('should generate python template project', () => {
      const result = generateProject('test-python', 'python', tempDir);
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('pyproject.toml');
    });

    it('should generate luminexo template project', () => {
      const result = generateProject('test-luminexo', 'luminexo', tempDir);
      
      expect(result.success).toBe(true);
      expect(result.files).toContain('HEARTBEAT_LUMINEXO.md');
      expect(result.files).toContain('MEMORY.md');
    });

    it('should fail for invalid template', () => {
      const result = generateProject('test-fail', 'invalid-template', tempDir);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('no encontrada');
    });

    it('should replace PROJECT_NAME placeholder', () => {
      const result = generateProject('mi-proyecto', 'default', tempDir);
      
      expect(result.success).toBe(true);
      
      const configPath = path.join(tempDir, 'mi-proyecto', 'heartbeat.config.json');
      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('"name": "mi-proyecto"');
    });

    it('should replace DATE placeholder', () => {
      const result = generateProject('test-date', 'default', tempDir);
      const today = new Date().toISOString().split('T')[0];
      
      expect(result.success).toBe(true);
      
      const goalsPath = path.join(tempDir, 'test-date', 'GOALS.md');
      const content = fs.readFileSync(goalsPath, 'utf-8');
      expect(content).toContain(today);
    });

    it('should create directories', () => {
      const result = generateProject('test-dirs', 'luminexo', tempDir);
      
      expect(result.success).toBe(true);
      
      const srcDir = path.join(tempDir, 'test-dirs', 'src');
      const docsDir = path.join(tempDir, 'test-dirs', 'docs');
      const templatesDir = path.join(tempDir, 'test-dirs', 'templates');
      const memoryDir = path.join(tempDir, 'test-dirs', 'memory');
      
      expect(fs.existsSync(srcDir)).toBe(true);
      expect(fs.existsSync(docsDir)).toBe(true);
      expect(fs.existsSync(templatesDir)).toBe(true);
      expect(fs.existsSync(memoryDir)).toBe(true);
    });
  });
});