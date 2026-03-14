import fs from 'fs';
import path from 'path';

interface InitOptions {
  template: string;
  directory: string;
}

export function initCommand(name: string = 'heartbeat-project', options: InitOptions) {
  // Handle empty string as name
  const projectName = name || 'heartbeat-project';
  const projectDir = path.join(options.directory, projectName);
  
  console.log(`🚀 Inicializando proyecto: ${projectName}`);
  console.log(`📁 Directorio: ${projectDir}`);
  console.log(`📋 Plantilla: ${options.template}`);

  // Crear estructura de directorios
  const directories = [
    projectDir,
    path.join(projectDir, 'src'),
    path.join(projectDir, 'templates'),
    path.join(projectDir, 'docs'),
  ];

  for (const dir of directories) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // Crear archivo de configuración de heartbeat
  const heartbeatConfig = {
    name: projectName,
    version: '0.1.0',
    heartbeat: {
      interval: 300000, // 5 minutos
      maxRetries: 3,
      timeout: 60000,
    },
    ollama: {
      enabled: true,
      baseUrl: 'http://localhost:11434',
      model: 'llama3',
    },
    logging: {
      level: 'info',
      file: 'heartbeat.log',
    },
  };

  fs.writeFileSync(
    path.join(projectDir, 'heartbeat.config.json'),
    JSON.stringify(heartbeatConfig, null, 2)
  );

  // Crear GOALS.md inicial
  const goalsContent = `# GOALS.md - ${projectName}

## Fase Actual: Inicialización

### Objetivo Principal

Establecer la infraestructura base del proyecto.

### Metas

- [ ] Configurar entorno de desarrollo
- [ ] Crear estructura de archivos
- [ ] Documentar arquitectura

---
*Creado: ${new Date().toISOString().split('T')[0]}*
`;

  fs.writeFileSync(path.join(projectDir, 'GOALS.md'), goalsContent);

  // Crear HEARTBEAT_COUNTER.md
  const counterContent = `# HEARTBEAT_COUNTER.md

Contador de heartbeats para ${projectName}.

## Estado Actual

**Contador:** 1

## Historial

| # | Fecha | Modo | Acción |
|---|------|------|--------|
| 1 | ${new Date().toISOString().split('T')[0]} | A | Inicialización del proyecto |

---
*Actualizado automáticamente.*
`;

  fs.writeFileSync(path.join(projectDir, 'HEARTBEAT_COUNTER.md'), counterContent);

  console.log('✅ Proyecto inicializado correctamente');
  console.log('   Archivos creados:');
  console.log('   - heartbeat.config.json');
  console.log('   - GOALS.md');
  console.log('   - HEARTBEAT_COUNTER.md');
  console.log('');
  console.log('Para comenzar:');
  console.log(`  cd ${projectName}`);
  console.log('  heartbeat run');
}