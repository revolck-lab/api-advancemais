/**
 * Configurações do serviço de email Brevo
 */
import { config } from "./env";
import { logger } from "../utils/logger";

export const brevoConfig = {
  // Credenciais
  apiKey: config.BREVO_API_KEY,

  // Configurações padrão de email
  defaultFrom: {
    email: config.EMAIL_FROM || "noreply@advancemais.com.br",
    name: config.EMAIL_FROM_NAME || "AdvanceMais",
  },
  defaultReplyTo: config.EMAIL_REPLY_TO || "suporte@advancemais.com.br",

  // Status de configuração
  isConfigured: !!config.BREVO_API_KEY,

  // Inicializador
  init: () => {
    if (!brevoConfig.isConfigured) {
      logger.warn("Brevo não configurado. Emails não serão enviados.");
      return false;
    }

    logger.info("Configuração do Brevo inicializada com sucesso.");
    return true;
  },
};
