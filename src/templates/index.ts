import fs from 'fs';
import path from 'path';

export interface TemplateConfig {
  name: string;
  description: string;
  files: TemplateFile[];
  directories: string[];
}

export interface TemplateFile {
  path: string;
  content: string;
}

export const templates: Record<string, TemplateConfig> = {
  default: {
    name: 'default',
    description: 'Plantilla genérica para cualquier proyecto',
    directories: ['src', 'docs', 'templates'],
    files: [],
  },
  nodejs: {
    name: 'nodejs',
    description: 'Plantilla para proyectos Node.js/TypeScript',
    directories: ['src', 'tests', 'docs'],
    files: [],
  },
  python: {
    name: 'python',
    description: 'Plantilla para proyectos Python',
    directories: ['src', 'tests', 'docs'],
    files: [],
  },
  luminexo: {
    name: 'luminexo',
    description: 'Plantilla completa del sistema Luminexo',
    directories: ['src', 'docs', 'templates'],
    files: [],
  },
};

export function getTemplate(name: string): TemplateConfig | null {
  return templates[name] || null;
}

export function listTemplates(): string[] {
  return Object.keys(templates);
}

export function getTemplateDescription(name: string): string | null {
  const template = templates[name];
  return template ? template.description : null;
}