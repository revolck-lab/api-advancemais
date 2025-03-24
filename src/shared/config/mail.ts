/**
 * Configurações de email
 */
import { config } from "./env";
import { logger } from "../utils/logger";
import { brevoConfig } from "./brevo";

// Configurações de email
export const mailConfig = {
  // Servidor SMTP - mantido para compatibilidade
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },

  // Configurações padrão de email - usando Brevo
  defaultFrom: brevoConfig.defaultFrom,
  defaultReplyTo: brevoConfig.defaultReplyTo,

  // Configuração de Brevo
  brevo: brevoConfig,

  // Configuração de templates
  templatesDir: "src/services/notification-service/email-templates",

  // Verificação de configuração
  isConfigured: brevoConfig.isConfigured,

  // Funções de utilidade
  getTemplateVars: () => ({
    baseUrl:
      config.NODE_ENV === "production"
        ? "https://advancemais.com.br"
        : `http://localhost:${config.PORT}`,
    currentYear: new Date().getFullYear(),
    companyName: "AdvanceMais",
    supportEmail: brevoConfig.defaultReplyTo,
    logoUrl: "https://advancemais.com.br/assets/logo.png",
  }),

  // Verificação do ambiente de email
  init: () => {
    return brevoConfig.init();
  },
};
