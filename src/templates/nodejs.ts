import { TemplateConfig } from './index';

export const nodejsTemplate: TemplateConfig = {
  name: 'nodejs',
  description: 'Plantilla para proyectos Node.js/TypeScript',
  directories: ['src', 'tests', 'docs', 'dist'],
  files: [
    {
      path: 'package.json',
      content: `{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "description": "Proyecto Node.js con heartbeats",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "start": "node dist/index.js",
    "heartbeat": "heartbeat run"
  },
  "keywords": ["heartbeat", "nodejs", "typescript"],
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}`,
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}`,
    },
    {
      path: 'src/index.ts',
      content: `/**
 * {{PROJECT_NAME}}
 * 
 * Proyecto Node.js con sistema de heartbeats.
 */

export const VERSION = '0.1.0';

export function greet(name: string = 'World'): string {
  return \`Hello, \${name}!\`;
}

// Exportar módulos adicionales aquí
`,
    },
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
  },
  "nodejs": {
    "nodeVersion": ">=18.0.0",
    "packageManager": "npm"
  }
}`,
    },
    {
      path: 'GOALS.md',
      content: `# GOALS.md - {{PROJECT_NAME}}

## Fase Actual: Inicialización

### Objetivo Principal

Establecer la infraestructura base del proyecto Node.js.

### Metas

- [ ] Instalar dependencias (\`npm install\`)
- [ ] Compilar TypeScript (\`npm run build\`)
- [ ] Ejecutar tests (\`npm test\`)
- [ ] Configurar CI/CD

## Milestones

### v0.1.0 - MVP

- [ ] Funcionalidad básica
- [ ] Tests unitarios
- [ ] Documentación inicial

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
    {
      path: '.gitignore',
      content: `# Dependencies
node_modules/
package-lock.json

# Build output
dist/
*.tsbuildinfo

# Logs
*.log
heartbeat.log

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`,
    },
  ],
};