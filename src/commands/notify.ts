import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { WebhookClient, WebhookManager, WebhookConfig } from '../webhooks';
import { logger } from '../logger';

interface NotifyOptions {
  test: boolean;
  list: boolean;
  webhook?: string;
  message?: string;
}

interface HeartbeatConfig {
  name: string;
  version: string;
  webhooks?: Record<string, WebhookConfig>;
}

const DEFAULT_CONFIG_FILE = 'heartbeat.config.json';

export async function notifyCommand(options: NotifyOptions) {
  const configPath = path.resolve(process.cwd(), DEFAULT_CONFIG_FILE);

  // Check if config exists
  if (!fs.existsSync(configPath)) {
    logger.error('No existe archivo de configuración');
    logger.info('💡 Usa "heartbeat init" para crear un proyecto');
    return;
  }

  const config: HeartbeatConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

  // Initialize webhook manager
  const manager = new WebhookManager();
  
  if (config.webhooks) {
    for (const [name, webhookConfig] of Object.entries(config.webhooks)) {
      manager.add(name, webhookConfig);
    }
  }

  // List webhooks
  if (options.list) {
    const webhooks = manager.list();
    
    if (webhooks.length === 0) {
      logger.info('📭 No hay webhooks configurados');
      logger.info('💡 Añade webhooks a tu heartbeat.config.json:');
      logger.info(`
{
  "webhooks": {
    "slack": {
      "provider": "slack",
      "url": "https://hooks.slack.com/services/...",
      "enabled": true
    },
    "discord": {
      "provider": "discord", 
      "url": "https://discord.com/api/webhooks/...",
      "enabled": true
    }
  }
}`);
      return;
    }

    logger.info('📡 Webhooks configurados:');
    for (const name of webhooks) {
      const webhookConfig = config.webhooks?.[name];
      if (webhookConfig) {
        const status = webhookConfig.enabled ? '✅' : '⏸️';
        logger.info(`   ${status} ${name} (${webhookConfig.provider})`);
      }
    }
    return;
  }

  // Test webhook
  if (options.test) {
    if (options.webhook) {
      // Test specific webhook
      try {
        logger.progress(`Enviando mensaje de prueba a ${options.webhook}...`);
        const success = await manager.test(options.webhook);
        if (success) {
          logger.success(`Mensaje de prueba enviado a ${options.webhook}`);
        } else {
          logger.error(`Falló el envío de prueba a ${options.webhook}`);
        }
      } catch (error) {
        logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      // Test all webhooks
      const webhooks = manager.list();
      if (webhooks.length === 0) {
        logger.error('No hay webhooks configurados');
        return;
      }

      logger.progress('Enviando mensajes de prueba a todos los webhooks...');
      const results = await Promise.all(
        webhooks.map(async (name) => {
          const success = await manager.test(name).catch(() => false);
          return { name, success };
        })
      );

      logger.info('📋 Resultados de prueba:');
      for (const { name, success } of results) {
        if (success) {
          logger.success(`   ✓ ${name}`);
        } else {
          logger.error(`   ✗ ${name}`);
        }
      }
    }
    return;
  }

  // Send custom message
  if (options.message) {
    if (options.webhook) {
      try {
        logger.progress(`Enviando mensaje a ${options.webhook}...`);
        const success = await manager.sendTo(options.webhook, options.message);
        if (success) {
          logger.success(`Mensaje enviado a ${options.webhook}`);
        } else {
          logger.error(`Falló el envío a ${options.webhook}`);
        }
      } catch (error) {
        logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      // Broadcast to all
      logger.progress('Enviando mensaje a todos los webhooks...');
      const results = await manager.broadcast(options.message);
      
      logger.info('📋 Resultados:');
      for (const [name, success] of Object.entries(results)) {
        if (success) {
          logger.success(`   ✓ ${name}`);
        } else {
          logger.error(`   ✗ ${name}`);
        }
      }
    }
    return;
  }

  // No options - show help
  logger.info('💡 Opciones disponibles:');
  logger.info('   --list              Listar webhooks configurados');
  logger.info('   --test              Enviar mensaje de prueba');
  logger.info('   --test --webhook    Enviar prueba a webhook específico');
  logger.info('   --message <text>   Enviar mensaje personalizado');
  logger.info('📖 Ejemplos:');
  logger.info('   heartbeat notify --list');
  logger.info('   heartbeat notify --test');
  logger.info('   heartbeat notify --test --webhook slack');
  logger.info('   heartbeat notify --message "Deploy completado"');
}

// Export for CLI registration
export function registerNotifyCommand(program: Command): void {
  program
    .command('notify')
    .description('Gestiona notificaciones webhook (Slack, Discord, Telegram)')
    .option('--test', 'Enviar mensaje de prueba', false)
    .option('--list', 'Listar webhooks configurados', false)
    .option('--webhook <name>', 'Webhook específico a usar')
    .option('--message <text>', 'Mensaje a enviar')
    .action(notifyCommand);
}
