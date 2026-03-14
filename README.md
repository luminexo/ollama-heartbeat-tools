# Ollama Heartbeat Tools

Toolkit de utilidades para sistemas de heartbeat automatizados usando Ollama.

## Descripción

Este proyecto proporciona herramientas y plantillas para implementar sistemas de desarrollo continuo mediante heartbeats automatizados, con integración nativa para modelos locales a través de Ollama.

## Características

- **CLI de Heartbeats:** Herramienta de línea de comandos para gestionar heartbeats
- **Modos alternados:** Sistema de modos A (GitHub) y B (Exploración)
- **Integración Ollama:** Soporte nativo para modelos locales
- **Templates:** Plantillas reutilizables para diferentes tipos de proyectos

## Instalación

```bash
# Próximamente
npm install -g ollama-heartbeat-tools
```

## Uso Rápido

```bash
# Inicializar un nuevo proyecto con heartbeats
heartbeat init mi-proyecto

# Ejecutar un heartbeat manual
heartbeat run

# Verificar estado del proyecto
heartbeat status

# Consultar a Ollama
heartbeat ask "¿Cómo optimizar este código?"

# Verificar conexión Ollama
heartbeat config --check

# Listar configuración
heartbeat config --list

# Cambiar modelo por defecto
heartbeat config --ollama-model llama3
```

## Comandos

### `heartbeat init [name]`

Inicializa un nuevo proyecto con la estructura de heartbeats.

**Opciones:**
- `-t, --template <template>` - Plantilla a usar (default: "default")
- `-d, --directory <dir>` - Directorio de destino (default: ".")

### `heartbeat run`

Ejecuta un heartbeat manual.

**Modos alternados:**
- **Modo A (Impar)** - Dominio de GitHub: Verifica estado de git, auth GitHub
- **Modo B (Par)** - Exploración: Lista archivos, verifica documentación

**Opciones:**
- `-c, --config <file>` - Archivo de configuración
- `-v, --verbose` - Salida detallada

### `heartbeat status`

Muestra el estado actual del sistema.

**Opciones:**
- `-j, --json` - Salida en formato JSON

### `heartbeat ask <prompt>`

Envía un prompt a Ollama y muestra la respuesta.

**Opciones:**
- `-m, --model <model>` - Modelo a usar (default: "llama3")
- `-v, --verbose` - Mostrar información detallada

### `heartbeat config`

Gestiona la configuración de heartbeat y Ollama.

**Opciones:**
- `--list` - Listar configuración actual
- `--set <key=value>` - Establecer un valor de configuración
- `--ollama-url <url>` - Establecer URL de Ollama
- `--ollama-model <model>` - Establecer modelo por defecto
- `--check` - Verificar conexión con Ollama

## Estructura del Proyecto

```
ollama-heartbeat-tools/
├── src/
│   ├── index.ts              # Entry point y exports
│   ├── cli.ts                # Definición del CLI
│   ├── commands/
│   │   ├── init.ts           # Comando init
│   │   ├── run.ts            # Comando run
│   │   ├── status.ts         # Comando status
│   │   ├── ask.ts            # Comando ask (Ollama)
│   │   └── config.ts         # Comando config
│   ├── ollama/
│   │   ├── client.ts         # Cliente HTTP de Ollama
│   │   └── types.ts          # Tipos TypeScript
│   └── __tests__/            # Tests unitarios
├── .github/workflows/
│   └── ci.yml                # CI/CD
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Requisitos

- Node.js 18 o superior
- Ollama (opcional, para integración con IA)

## Desarrollo

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Ejecutar tests
npm test

# Ejecutar en desarrollo
npx ts-node src/cli.ts status
```

## Estado

🚧 En desarrollo activo - v0.1.0

## Licencia

MIT

## Contribuir

¡Las contribuciones son bienvenidas! Por favor, revisa los issues abiertos.

---

*Proyecto del ecosistema [Luminexo](https://github.com/luminexo)*