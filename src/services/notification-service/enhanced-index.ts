import { enhancedEmailRoutes } from "./routes/enhanced-email.routes";
import { enhancedEmailService } from "./services/enhanced-email.service";
import { logger } from "@shared/utils/logger";
import { ErrorHandler } from "@shared/utils/error-handler";

/**
 * Inicialização do serviço de notificação aprimorado
 */
export function initEnhancedNotificationService() {
  return ErrorHandler.capture(
    () => {
      const emailInitialized = enhancedEmailService.isInitialized();
      const emailStatus = emailInitialized
        ? "inicializado"
        : "não inicializado (tentará novamente em segundo plano)";

      logger.info(
        `Serviço de notificação aprimorado carregado. Email: ${emailStatus}`
      );

      // Mesmo que o serviço não esteja completamente inicializado,
      // retornamos sucesso pois ele tentará inicializar-se em background
      return true;
    },
    {
      context: "Inicialização do serviço de notificação aprimorado",
      defaultReturn: true, // Não falhe na inicialização da aplicação
    }
  );
}

// Exportar rotas e serviços
export { enhancedEmailRoutes, enhancedEmailService };
