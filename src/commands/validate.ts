import fs from 'fs';
import path from 'path';

interface ValidateOptions {
  verbose: boolean;
  fix: boolean;
}

interface ValidationError {
  file: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  checked: string[];
}

export function validateCommand(options: ValidateOptions) {
  console.log('🔍 Validando configuración de heartbeat...\n');
  
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
    checked: []
  };

  // Buscar archivos de configuración
  const projectDir = process.cwd();
  
  // 1. Validar heartbeat.config.json
  validateConfigJson(projectDir, result);
  
  // 2. Validar HEARTBEAT.md si existe
  validateHeartbeatMd(projectDir, result);
  
  // 3. Validar GOALS.md si existe
  validateGoalsMd(projectDir, result);
  
  // 4. Validar MEMORY.md si existe
  validateMemoryMd(projectDir, result);
  
  // 5. Validar HEARTBEAT_COUNTER.md si existe
  validateCounterMd(projectDir, result);
  
  // Imprimir resultados
  printResults(result, options.verbose);
  
  // Exit con código de error si hay errores
  if (result.errors.length > 0) {
    process.exit(1);
  }
}

function validateConfigJson(projectDir: string, result: ValidationResult) {
  const configPath = path.join(projectDir, 'heartbeat.config.json');
  result.checked.push('heartbeat.config.json');
  
  if (!fs.existsSync(configPath)) {
    result.errors.push({
      file: 'heartbeat.config.json',
      message: 'Archivo de configuración no encontrado',
      severity: 'error'
    });
    result.valid = false;
    return;
  }
  
  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);
    
    // Validar campos requeridos
    if (!config.name) {
      result.errors.push({
        file: 'heartbeat.config.json',
        message: 'Campo requerido "name" no encontrado',
        severity: 'error'
      });
      result.valid = false;
    }
    
    if (!config.version) {
      result.warnings.push({
        file: 'heartbeat.config.json',
        message: 'Campo "version" recomendado pero no encontrado',
        severity: 'warning'
      });
    }
    
    // Validar configuración de heartbeat
    if (config.heartbeat) {
      if (typeof config.heartbeat.interval !== 'number' || config.heartbeat.interval < 0) {
        result.errors.push({
          file: 'heartbeat.config.json',
          message: 'heartbeat.interval debe ser un número positivo',
          severity: 'error'
        });
        result.valid = false;
      }
      
      if (typeof config.heartbeat.maxRetries !== 'number' || config.heartbeat.maxRetries < 0) {
        result.warnings.push({
          file: 'heartbeat.config.json',
          message: 'heartbeat.maxRetries debería ser un número positivo',
          severity: 'warning'
        });
      }
    } else {
      result.warnings.push({
        file: 'heartbeat.config.json',
        message: 'Sección "heartbeat" no configurada',
        severity: 'warning'
      });
    }
    
    // Validar configuración de Ollama
    if (config.ollama) {
      if (config.ollama.enabled && !config.ollama.model) {
        result.warnings.push({
          file: 'heartbeat.config.json',
          message: 'Ollama habilitado pero sin modelo especificado',
          severity: 'warning'
        });
      }
      
      if (config.ollama.baseUrl) {
        try {
          new URL(config.ollama.baseUrl);
        } catch {
          result.errors.push({
            file: 'heartbeat.config.json',
            message: `URL de Ollama inválida: ${config.ollama.baseUrl}`,
            severity: 'error'
          });
          result.valid = false;
        }
      }
    }
    
  } catch (e) {
    result.errors.push({
      file: 'heartbeat.config.json',
      message: `Error de sintaxis JSON: ${(e as Error).message}`,
      severity: 'error'
    });
    result.valid = false;
  }
}

function validateHeartbeatMd(projectDir: string, result: ValidationResult) {
  const filePath = path.join(projectDir, 'HEARTBEAT.md');
  result.checked.push('HEARTBEAT.md');
  
  if (!fs.existsSync(filePath)) {
    result.warnings.push({
      file: 'HEARTBEAT.md',
      message: 'Archivo HEARTBEAT.md no encontrado (opcional)',
      severity: 'warning'
    });
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Validar estructura de secciones
    const requiredSections = ['# Heartbeat'];
    const foundSections: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        foundSections.push(line);
      }
    }
    
    // Verificar si tiene algún encabezado
    if (foundSections.length === 0) {
      result.warnings.push({
        file: 'HEARTBEAT.md',
        message: 'El archivo no tiene encabezados markdown',
        severity: 'warning'
      });
    }
    
    // Verificar instrucciones claras
    if (content.length < 50) {
      result.warnings.push({
        file: 'HEARTBEAT.md',
        message: 'Contenido muy corto, considera añadir más instrucciones',
        severity: 'warning'
      });
    }
    
  } catch (e) {
    result.errors.push({
      file: 'HEARTBEAT.md',
      message: `Error al leer archivo: ${(e as Error).message}`,
      severity: 'error'
    });
  }
}

function validateGoalsMd(projectDir: string, result: ValidationResult) {
  const filePath = path.join(projectDir, 'GOALS.md');
  result.checked.push('GOALS.md');
  
  if (!fs.existsSync(filePath)) {
    result.warnings.push({
      file: 'GOALS.md',
      message: 'Archivo GOALS.md no encontrado (recomendado)',
      severity: 'warning'
    });
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Validar que tiene objetivos definidos
    if (!content.includes('[') && !content.includes('-')) {
      result.warnings.push({
        file: 'GOALS.md',
        message: 'No se encontraron objetivos con checkboxes [ ] o [x]',
        severity: 'warning'
      });
    }
    
    // Validar estructura básica
    if (!content.includes('#')) {
      result.warnings.push({
        file: 'GOALS.md',
        message: 'El archivo debería tener encabezados markdown',
        severity: 'warning'
      });
    }
    
  } catch (e) {
    result.errors.push({
      file: 'GOALS.md',
      message: `Error al leer archivo: ${(e as Error).message}`,
      severity: 'error'
    });
  }
}

function validateMemoryMd(projectDir: string, result: ValidationResult) {
  const filePath = path.join(projectDir, 'MEMORY.md');
  result.checked.push('MEMORY.md');
  
  if (!fs.existsSync(filePath)) {
    // No es un error, es opcional
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Validar estructura cronológica
    if (content.includes('202') || content.includes('-')) {
      // Tiene fechas o items, bien
    } else if (content.length < 100) {
      result.warnings.push({
        file: 'MEMORY.md',
        message: 'Memoria muy corta, considera documentar más',
        severity: 'warning'
      });
    }
    
  } catch (e) {
    result.errors.push({
      file: 'MEMORY.md',
      message: `Error al leer archivo: ${(e as Error).message}`,
      severity: 'error'
    });
  }
}

function validateCounterMd(projectDir: string, result: ValidationResult) {
  const filePath = path.join(projectDir, 'HEARTBEAT_COUNTER.md');
  result.checked.push('HEARTBEAT_COUNTER.md');
  
  if (!fs.existsSync(filePath)) {
    // Es opcional para proyectos no-Luminexo
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Validar formato del contador
    const counterMatch = content.match(/\*\*Contador:\*\*\s*(\d+)/);
    if (!counterMatch) {
      result.errors.push({
        file: 'HEARTBEAT_COUNTER.md',
        message: 'Formato de contador inválido. Esperado: **Contador:** N',
        severity: 'error'
      });
      result.valid = false;
    } else {
      const counter = parseInt(counterMatch[1], 10);
      if (isNaN(counter) || counter < 0) {
        result.errors.push({
          file: 'HEARTBEAT_COUNTER.md',
          message: 'El contador debe ser un número entero positivo',
          severity: 'error'
        });
        result.valid = false;
      }
    }
    
  } catch (e) {
    result.errors.push({
      file: 'HEARTBEAT_COUNTER.md',
      message: `Error al leer archivo: ${(e as Error).message}`,
      severity: 'error'
    });
  }
}

function printResults(result: ValidationResult, verbose: boolean) {
  console.log('📁 Archivos verificados:');
  for (const file of result.checked) {
    console.log(`   ✓ ${file}`);
  }
  console.log('');
  
  // Errores
  if (result.errors.length > 0) {
    console.log('❌ Errores encontrados:');
    for (const err of result.errors) {
      const lineInfo = err.line ? ` (línea ${err.line})` : '';
      console.log(`   • ${err.file}${lineInfo}: ${err.message}`);
    }
    console.log('');
  }
  
  // Warnings
  if (result.warnings.length > 0) {
    console.log('⚠️ Advertencias:');
    for (const warn of result.warnings) {
      const lineInfo = warn.line ? ` (línea ${warn.line})` : '';
      console.log(`   • ${warn.file}${lineInfo}: ${warn.message}`);
    }
    console.log('');
  }
  
  // Resumen
  if (result.valid && result.errors.length === 0) {
    if (result.warnings.length === 0) {
      console.log('✅ Validación completada: Todo correcto');
    } else {
      console.log(`✅ Validación completada: Correcto con ${result.warnings.length} advertencia(s)`);
    }
  } else {
    console.log(`❌ Validación fallida: ${result.errors.length} error(es) encontrado(s)`);
  }
  
  if (verbose) {
    console.log('\n📊 Resumen:');
    console.log(`   Archivos verificados: ${result.checked.length}`);
    console.log(`   Errores: ${result.errors.length}`);
    console.log(`   Advertencias: ${result.warnings.length}`);
  }
}