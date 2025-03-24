import { emailRoutes } from "./routes/email.routes";
import { emailService } from "./services/email.service";
import { logger } from "@shared/utils/logger";

/**
 * Inicialização do serviço de notificação
 */
export function initNotificationService() {
  try {
    // Tentar inicializar o serviço de email, mas não falhar se houver problemas
    const emailAvailable = emailService ? true : false;
    logger.info(
      `Serviço de notificação inicializado. Email: ${
        emailAvailable ? "disponível" : "indisponível"
      }`
    );

    if (!emailAvailable) {
      logger.warn(
        "Serviço de email indisponível. Alguns recursos de email podem não funcionar."
      );
    }

    // Sempre retornar true para não interromper a inicialização da aplicação
    return true;
  } catch (error) {
    logger.error("Erro ao inicializar serviço de notificação:", error);

    // Mesmo com erro, retornamos true para não interromper a inicialização da aplicação
    // O serviço de email simplesmente não estará disponível
    return true;
  }
}

// Exportar rotas e serviços
export { emailRoutes, emailService };
