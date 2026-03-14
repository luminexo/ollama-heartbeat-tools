import { TemplateConfig } from './index';

export const defaultTemplate: TemplateConfig = {
  name: 'default',
  description: 'Plantilla genérica para cualquier proyecto',
  directories: ['src', 'docs', 'templates'],
  files: [
    {
      path: 'heartbeat.config.json',
      content: `{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "heartbeat": {
    "interval": 300000,
    "maxRetries": 3,
    "timeout": 60000
  },
  "ollama": {
    "enabled": true,
    "baseUrl": "http://localhost:11434",
    "model": "llama3"
  },
  "logging": {
    "level": "info",
    "file": "heartbeat.log"
  }
}`,
    },
    {
      path: 'GOALS.md',
      content: `# GOALS.md - {{PROJECT_NAME}}

## Fase Actual: Inicialización

### Objetivo Principal

Establecer la infraestructura base del proyecto.

### Metas

- [ ] Configurar entorno de desarrollo
- [ ] Crear estructura de archivos
- [ ] Documentar arquitectura

---
*Creado: {{DATE}}*
`,
    },
    {
      path: 'HEARTBEAT_COUNTER.md',
      content: `# HEARTBEAT_COUNTER.md

Contador de heartbeats para {{PROJECT_NAME}}.

## Estado Actual

**Contador:** 1

## Historial

| # | Fecha | Modo | Acción |
|---|------|------|--------|
| 1 | {{DATE}} | A | Inicialización del proyecto |

---
*Actualizado automáticamente.*
`,
    },
  ],
};