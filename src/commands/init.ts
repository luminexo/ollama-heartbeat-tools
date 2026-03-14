import fs from 'fs';
import path from 'path';
import { generateProject, getAvailableTemplates, getTemplateInfo } from '../templates/generator';

interface InitOptions {
  template: string;
  directory: string;
}

export function initCommand(name: string = 'heartbeat-project', options: InitOptions) {
  // Handle empty string as name
  const projectName = name || 'heartbeat-project';
  const templateName = options.template || 'default';
  const targetDir = options.directory || process.cwd();

  console.log(`🚀 Inicializando proyecto: ${projectName}`);
  console.log(`📁 Directorio: ${targetDir}`);
  console.log(`📋 Plantilla: ${templateName}`);

  // Verificar que la plantilla existe
  const templateInfo = getTemplateInfo(templateName);
  if (!templateInfo) {
    console.log(`\n❌ Plantilla '${templateName}' no encontrada.`);
    console.log('\nPlantillas disponibles:');
    for (const t of getAvailableTemplates()) {
      const info = getTemplateInfo(t);
      console.log(`  - ${t}: ${info?.description}`);
    }
    process.exit(1);
  }

  console.log(`   Descripción: ${templateInfo.description}`);

  // Generar proyecto
  const result = generateProject(projectName, templateName, targetDir);

  if (!result.success) {
    console.log('\n❌ Error al crear el proyecto:');
    for (const err of result.errors) {
      console.log(`   - ${err}`);
    }
    process.exit(1);
  }

  console.log('\n✅ Proyecto inicializado correctamente');
  console.log('   Archivos creados:');
  for (const file of result.files) {
    console.log(`   - ${file}`);
  }

  // Mostrar instrucciones específicas según la plantilla
  console.log('\n📖 Para comenzar:');
  console.log(`   cd ${projectName}`);
  
  if (templateName === 'nodejs') {
    console.log('   npm install');
    console.log('   npm run build');
    console.log('   npm test');
  } else if (templateName === 'python') {
    console.log('   python -m venv venv');
    console.log('   source venv/bin/activate  # Linux/Mac');
    console.log('   pip install -e ".[dev]"');
    console.log('   pytest');
  }
  
  console.log('   heartbeat run');
  
  // Mostrar próximo paso
  console.log('\n📝 Próximo paso:');
  console.log('   Edita GOALS.md para definir tus objetivos.');
  console.log('   Ejecuta `heartbeat status` para ver el estado actual.');
}

export function listTemplatesCommand() {
  console.log('📋 Plantillas disponibles:\n');
  
  for (const name of getAvailableTemplates()) {
    const info = getTemplateInfo(name);
    console.log(`  ${name}`);
    console.log(`    ${info?.description}`);
    console.log('');
  }
  
  console.log('Uso: heartbeat init -t <plantilla> <nombre-proyecto>');
}