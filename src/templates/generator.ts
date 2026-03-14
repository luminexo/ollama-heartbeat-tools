import fs from 'fs';
import path from 'path';
import { TemplateConfig, TemplateFile } from './index';
import { defaultTemplate } from './default';
import { nodejsTemplate } from './nodejs';
import { pythonTemplate } from './python';
import { luminexoTemplate } from './luminexo';

export const allTemplates = {
  default: defaultTemplate,
  nodejs: nodejsTemplate,
  python: pythonTemplate,
  luminexo: luminexoTemplate,
};

export function generateProject(
  projectName: string,
  templateName: string,
  targetDir: string
): { success: boolean; files: string[]; errors: string[] } {
  const result: { success: boolean; files: string[]; errors: string[] } = {
    success: true,
    files: [],
    errors: [],
  };

  // Obtener plantilla
  const template = allTemplates[templateName as keyof typeof allTemplates];
  if (!template) {
    result.success = false;
    result.errors.push(`Plantilla '${templateName}' no encontrada`);
    return result;
  }

  const projectDir = path.join(targetDir, projectName);
  const today = new Date().toISOString().split('T')[0];

  // Crear directorios
  for (const dir of template.directories) {
    const dirPath = path.join(projectDir, dir);
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch (err) {
      result.errors.push(`Error creando directorio ${dir}: ${err}`);
      result.success = false;
    }
  }

  // Crear archivos con reemplazo de variables
  for (const file of template.files) {
    const filePath = path.join(projectDir, file.path.replace(/{{PROJECT_NAME}}/g, projectName));
    const content = file.content
      .replace(/{{PROJECT_NAME}}/g, projectName)
      .replace(/{{DATE}}/g, today);

    try {
      // Asegurar que el directorio padre existe
      const parentDir = path.dirname(filePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(filePath, content);
      result.files.push(file.path);
    } catch (err) {
      result.errors.push(`Error creando archivo ${file.path}: ${err}`);
      result.success = false;
    }
  }

  return result;
}

export function getAvailableTemplates(): string[] {
  return Object.keys(allTemplates);
}

export function getTemplateInfo(name: string): { name: string; description: string } | null {
  const template = allTemplates[name as keyof typeof allTemplates];
  if (!template) return null;
  return {
    name: template.name,
    description: template.description,
  };
}