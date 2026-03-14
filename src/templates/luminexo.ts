import { TemplateConfig } from './index';

export const luminexoTemplate: TemplateConfig = {
  name: 'luminexo',
  description: 'Plantilla completa del sistema Luminexo',
  directories: ['src', 'docs', 'templates', 'memory'],
  files: [
    {
      path: 'heartbeat.config.json',
      content: `{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "heartbeat": {
    "interval": 300000,
    "maxRetries": 3,
    "timeout": 60000,
    "modes": {
      "A": {
        "name": "Dominio de GitHub",
        "description": "Tareas relacionadas con GitHub: issues, PRs, contribuciones",
        "actions": [
          "gh auth status",
          "gh issue list",
          "gh pr list",
          "git status"
        ]
      },
      "B": {
        "name": "Exploración de Proyectos",
        "description": "Tareas de exploración y documentación",
        "actions": [
          "Revisar archivos del workspace",
          "Actualizar documentación",
          "Sintetizar ideas"
        ]
      }
    }
  },
  "ollama": {
    "enabled": true,
    "baseUrl": "http://localhost:11434",
    "model": "llama3"
  },
  "logging": {
    "level": "info",
    "file": "heartbeat.log"
  },
  "luminexo": {
    "autoCommit": true,
    "autoPush": false,
    "githubAccount": ""
  }
}`,
    },
    {
      path: 'GOALS.md',
      content: `# GOALS.md - Objetivos del Proyecto Luminexo

## Visión General

{{PROJECT_NAME}} es un sistema de desarrollo continuo mediante heartbeats automatizados.

---

## Fase Actual: Inicialización

### Objetivo Principal

Establecer la infraestructura base y definir el flujo de trabajo.

### Metas Específicas

- [ ] Crear estructura de archivos de heartbeat
- [ ] Configurar autenticación GitHub
- [ ] Definir proyecto principal de trabajo
- [ ] Establecer workflow de contribución

---

## Proyecto Seleccionado: TBD

**Repositorio:** Por definir

**Issues pendientes:**
- TBD

---

## Próximos Pasos

### Modo A (Impar)
1. Verificar \`gh auth status\`
2. Listar repositorios disponibles
3. Crear/actualizar issues

### Modo B (Par)
1. Explorar documentación
2. Revisar código existente
3. Actualizar MEMORY.md

---

## Métricas de Progreso

| Métrica | Valor | Meta |
|---------|-------|------|
| Commits | 0 | - |
| Issues abiertos | 0 | - |
| Issues resueltos | 0 | - |
| Milestones | 0 | - |

---
*Actualizado: {{DATE}}*
`,
    },
    {
      path: 'HEARTBEAT_COUNTER.md',
      content: `# HEARTBEAT_COUNTER.md

Contador de heartbeats para el sistema Luminexo.

## Estado Actual

**Contador:** 1

## Historial

| # | Fecha | Modo | Acción |
|---|------|------|--------|
| 1 | {{DATE}} | A | Inicialización del sistema |

*Actualizado automáticamente por el sistema de heartbeats.*
`,
    },
    {
      path: 'HEARTBEAT_LUMINEXO.md',
      content: `# HEARTBEAT_LUMINEXO.md - Modos de Operación

Sistema de heartbeats alternados para {{PROJECT_NAME}}.

## Modo A - Dominio de GitHub (Impar)

Cuando el contador es **IMPAR**, ejecutar tareas relacionadas con GitHub:

### Fases por GOALS.md

1. **Fase Inicial:** Configurar autenticación y verificar acceso a repositorios
2. **Fase de Exploración:** Revisar issues abiertos, PRs pendientes
3. **Fase de Mantenimiento:** Limpiar issues stale, revisar PRs antiguos
4. **Fase Activa:** Contribuir código, resolver issues

### Acciones Típicas

- \`gh auth status\` - Verificar autenticación
- \`gh repo list\` - Listar repositorios
- \`gh issue list\` - Revisar issues abiertos
- \`gh pr list\` - Revisar PRs pendientes
- Crear/actualizar issues según GOALS.md

---

## Modo B - Exploración de Proyectos (Par)

Cuando el contador es **PAR**, ejecutar tareas de exploración y documentación:

### Fases por GOALS.md

1. **Fase de Descubrimiento:** Explorar nuevas tecnologías y proyectos
2. **Fase de Análisis:** Evaluar proyectos existentes en el workspace
3. **Fase de Documentación:** Crear/mejorar documentación
4. **Fase de Síntesis:** Conectar ideas y generar propuestas

### Acciones Típicas

- Revisar archivos del workspace
- Buscar proyectos en GitHub relevantes
- Documentar hallazgos en MEMORY.md
- Actualizar GOALS.md con nuevos objetivos

---

## Estructura de Archivos

- \`HEARTBEAT_COUNTER.md\` - Contador de heartbeats
- \`HEARTBEAT_LUMINEXO.md\` - Este archivo (modos de operación)
- \`GOALS.md\` - Objetivos y fases actuales
- \`MEMORY.md\` - Memoria del proyecto

---
*Creado: {{DATE}}*
`,
    },
    {
      path: 'MEMORY.md',
      content: `# MEMORY.md - Memoria del Proyecto

Este archivo almacena información importante y decisiones del proyecto.

## Información del Proyecto

- **Nombre:** {{PROJECT_NAME}}
- **Creado:** {{DATE}}
- **Tipo:** Luminexo (sistema de heartbeats)

## Decisiones Importantes

| Fecha | Decisión | Razón |
|-------|----------|-------|
| {{DATE}} | Inicialización | Primer heartbeat del sistema |

## Notas

- Los heartbeats alternan entre Modo A (GitHub) y Modo B (Exploración)
- El contador determina qué modo ejecutar
- Documentar progreso después de cada heartbeat

---
*Este archivo se actualiza automáticamente.*
`,
    },
    {
      path: 'memory/.gitkeep',
      content: `# Directorio de memoria
Este directorio contiene notas diarias del proyecto.
Los archivos siguen el formato: YYYY-MM-DD.md
`,
    },
    {
      path: '.gitignore',
      content: `# Dependencies
node_modules/
__pycache__/
*.pyc

# Build output
dist/
build/

# Logs
*.log
heartbeat.log

# Environment
.env
.env.local
venv/
.venv/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Memory (optional)
# memory/*.md
`,
    },
  ],
};