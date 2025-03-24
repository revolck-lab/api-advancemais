/**
 * Configurações de email
 */
import { config } from "./env";
import { logger } from "../utils/logger";

// Configurações de email
export const mailConfig = {
  // Configurações do servidor SMTP
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },

  // Configurações padrão de email
  defaultFrom:
    process.env.EMAIL_FROM || "AdvanceMais <noreply@advancemais.com.br>",
  defaultReplyTo: process.env.EMAIL_REPLY_TO || "suporte@advancemais.com.br",

  // Configuração de templates
  templatesDir: "src/services/notification-service/email-templates",

  // Verificação de configuração
  isConfigured: !!process.env.SMTP_USER && !!process.env.SMTP_PASS,

  // Funções de utilidade
  getTemplateVars: () => ({
    baseUrl:
      config.NODE_ENV === "production"
        ? "https://advancemais.com.br"
        : `http://localhost:${config.PORT}`,
    currentYear: new Date().getFullYear(),
    companyName: "AdvanceMais",
    supportEmail: "suporte@advancemais.com.br",
  }),

  // Verificação do ambiente de email
  init: () => {
    if (!mailConfig.isConfigured) {
      logger.warn(
        "Servidor de email não configurado. Emails não serão enviados."
      );
      return false;
    }

    logger.info("Configuração de email inicializada.");
    return true;
  },
};
