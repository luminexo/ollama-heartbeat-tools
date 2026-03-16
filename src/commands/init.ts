import fs from 'fs';
import path from 'path';
import { generateProject, getAvailableTemplates, getTemplateInfo } from '../templates/generator';
import { logger } from '../logger';

interface InitOptions {
  template: string;
  directory: string;
}

export function initCommand(name: string = 'heartbeat-project', options: InitOptions) {
  // Handle empty string as name
  const projectName = name || 'heartbeat-project';
  const templateName = options.template || 'default';
  const targetDir = options.directory || process.cwd();

  logger.info(`🚀 Inicializando proyecto: ${projectName}`);
  logger.debug(`Directorio: ${targetDir}`);
  logger.debug(`Plantilla: ${templateName}`);

  // Verificar que la plantilla existe
  const templateInfo = getTemplateInfo(templateName);
  if (!templateInfo) {
    logger.error(`Plantilla '${templateName}' no encontrada.`);
    logger.info('Plantillas disponibles:');
    for (const t of getAvailableTemplates()) {
      const info = getTemplateInfo(t);
      logger.info(`  - ${t}: ${info?.description}`);
    }
    process.exit(1);
  }

  logger.debug(`Descripción: ${templateInfo.description}`);

  // Generar proyecto
  const result = generateProject(projectName, templateName, targetDir);

  if (!result.success) {
    logger.error('Error al crear el proyecto:');
    for (const err of result.errors) {
      logger.error(`   - ${err}`);
    }
    process.exit(1);
  }

  logger.success('Proyecto inicializado correctamente');
  logger.debug('Archivos creados:');
  for (const file of result.files) {
    logger.debug(`   - ${file}`);
  }

  // Mostrar instrucciones específicas según la plantilla
  logger.info('📖 Para comenzar:');
  logger.info(`   cd ${projectName}`);
  
  if (templateName === 'nodejs') {
    logger.info('   npm install');
    logger.info('   npm run build');
    logger.info('   npm test');
  } else if (templateName === 'python') {
    logger.info('   python -m venv venv');
    logger.info('   source venv/bin/activate  # Linux/Mac');
    logger.info('   pip install -e ".[dev]"');
    logger.info('   pytest');
  }
  
  logger.info('   heartbeat run');
  
  // Mostrar próximo paso
  logger.info('📝 Próximo paso:');
  logger.info('   Edita GOALS.md para definir tus objetivos.');
  logger.info('   Ejecuta `heartbeat status` para ver el estado actual.');
}

export function listTemplatesCommand() {
  logger.info('📋 Plantillas disponibles:');
  logger.info('');
  
  for (const name of getAvailableTemplates()) {
    const info = getTemplateInfo(name);
    logger.info(`  ${name}`);
    logger.info(`    ${info?.description}`);
    logger.info('');
  }
  
  logger.info('Uso: heartbeat init -t <plantilla> <nombre-proyecto>');
}