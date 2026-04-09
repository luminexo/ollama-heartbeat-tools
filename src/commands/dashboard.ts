import { startDashboard } from '../dashboard';
import { logger } from '../logger';

interface DashboardOptions {
  port: string;
}

export function dashboardCommand(options: DashboardOptions) {
  const port = parseInt(options.port, 10);
  
  if (isNaN(port) || port < 1 || port > 65535) {
    logger.error(`Puerto inválido: ${options.port}`);
    logger.info('💡 Usa un puerto entre 1 y 65535');
    process.exit(1);
  }

  logger.info('🚀 Iniciando servidor de dashboard...');
  logger.info(`   Puerto: ${port}`);
  
  startDashboard({ port });
}
