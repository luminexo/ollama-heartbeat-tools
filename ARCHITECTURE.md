# Arquitectura de ollama-heartbeat-tools

## Visión General

`ollama-heartbeat-tools` es un CLI para sistemas de heartbeat automatizados que se integra con Ollama para procesamiento de lenguaje natural.

## Estructura del Proyecto

```
ollama-heartbeat-tools/
├── src/
│   ├── index.ts          # Entry point y exports
│   ├── cli.ts            # Definición del CLI (Commander)
│   ├── commands/
│   │   ├── init.ts       # Comando: heartbeat init
│   │   ├── run.ts        # Comando: heartbeat run
│   │   └── status.ts     # Comando: heartbeat status
│   └── __tests__/        # Tests unitarios
├── .github/workflows/
│   └── ci.yml            # CI/CD (tests en Node 18/20/22)
├── package.json          # Dependencias y scripts
├── tsconfig.json         # Configuración TypeScript
└── jest.config.js        # Configuración de tests
```

## Comandos CLI

### `heartbeat init [name]`

Inicializa un nuevo proyecto con la estructura de heartbeats.

**Opciones:**
- `-t, --template <template>` - Plantilla a usar (default: "default")
- `-d, --directory <dir>` - Directorio de destino (default: ".")

**Archivos creados:**
- `heartbeat.config.json` - Configuración del proyecto
- `GOALS.md` - Objetivos del proyecto
- `HEARTBEAT_COUNTER.md` - Contador de heartbeats

### `heartbeat run`

Ejecuta un heartbeat manual.

**Opciones:**
- `-c, --config <file>` - Archivo de configuración (default: "heartbeat.config.json")
- `-v, --verbose` - Salida detallada

**Modos alternados:**
- **Modo A (Impar)** - Dominio de GitHub: Verifica estado de git, auth GitHub
- **Modo B (Par)** - Exploración: Lista archivos, verifica documentación

### `heartbeat status`

Muestra el estado actual del sistema.

**Opciones:**
- `-j, --json` - Salida en formato JSON

**Información mostrada:**
- Nombre y versión del proyecto
- Contador de heartbeats
- Estado de documentación (GOALS.md, MEMORY.md)
- Estado de Git (branch, cambios pendientes)
- Configuración de Ollama

## Tipos de Datos

### `HeartbeatConfig`

```typescript
interface HeartbeatConfig {
  name: string;
  version: string;
  heartbeat: {
    interval: number;      // ms (default: 300000 = 5 min)
    maxRetries: number;    // (default: 3)
    timeout: number;       // ms (default: 60000)
  };
  ollama: {
    enabled: boolean;
    baseUrl: string;       // (default: "http://localhost:11434")
    model: string;         // (default: "llama3")
  };
  logging: {
    level: string;         // (default: "info")
    file: string;          // (default: "heartbeat.log")
  };
}
```

### `ProjectStatus`

```typescript
interface ProjectStatus {
  name: string;
  version: string;
  heartbeatCount: number;
  hasGoals: boolean;
  hasMemory: boolean;
  isGitRepo: boolean;
  gitBranch?: string;
  gitClean?: boolean;
  ollamaEnabled: boolean;
  ollamaModel: string;
}
```

## Flujo de Datos

```
┌─────────────────┐
│   CLI Input     │
│ (Commander.js)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Command Parser │
│  (cli.ts)       │
└────────┬────────┘
         │
         ├─── init ──► init.ts ──► Crear archivos
         │
         ├─── run ───► run.ts ───► Leer config
         │                              │
         │                              ▼
         │                    ┌─────────────────┐
         │                    │  Modo A o B     │
         │                    │  (según contador)│
         │                    └─────────────────┘
         │
         └─── status ► status.ts ─► Leer estado
```

## Dependencias

| Paquete | Propósito |
|---------|-----------|
| `commander` | Framework CLI |
| `jest` | Testing framework |
| `ts-jest` | Jest para TypeScript |
| `@types/jest` | Tipos para Jest |
| `typescript` | Compilador TypeScript |

## CI/CD

**Archivo:** `.github/workflows/ci.yml`

**Triggers:** Push y Pull Request a `main`

**Jobs:**
1. **test** - Ejecuta tests en Node 18, 20, 22
2. **lint** - Verifica formato (preparado)
3. **build** - Compila TypeScript

**Publicación:** Workflow preparado para NPM (`npm publish`)

## Próximos Pasos

### Integración con Ollama (Issue #2)

1. **Cliente Ollama**
   - Crear `src/ollama/client.ts`
   - Implementar conexión HTTP a Ollama API
   - Manejo de errores y reintentos

2. **Procesamiento de Heartbeats**
   - Modificar `run.ts` para usar Ollama
   - Generar respuestas contextuales
   - Formatear output con Markdown

3. **Comandos Nuevos**
   - `heartbeat ask <prompt>` - Pregunta directa a Ollama
   - `heartbeat config` - Configurar conexión Ollama

### Plantillas (Issue #3)

1. **Estructura de Plantillas**
   - Crear `src/templates/`
   - Plantillas predefinidas para proyectos comunes

2. **Tipos de Plantillas**
   - `default` - Proyecto genérico
   - `luminexo` - Sistema Luminexo completo
   - `minimal` - Solo archivos esenciales

---
*Documentado: 2026-03-14*
*Versión: 0.1.0*