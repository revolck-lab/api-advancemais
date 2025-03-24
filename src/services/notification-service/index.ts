import { emailRoutes } from "./routes/email.routes";
import { emailService } from "./services/email.service";
import { logger } from "@shared/utils/logger";

/**
 * Inicialização do serviço de notificação
 */
export function initNotificationService() {
  try {
    // Verificar se o serviço de email está configurado
    const emailStatus = emailService ? "disponível" : "indisponível";
    logger.info(`Serviço de notificação inicializado. Email: ${emailStatus}`);

    return true;
  } catch (error) {
    logger.error("Erro ao inicializar serviço de notificação:", error);
    return false;
  }
}

// Exportar rotas e serviços
export { emailRoutes, emailService };
