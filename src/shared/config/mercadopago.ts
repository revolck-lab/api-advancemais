/**
 * Configurações do Mercado Pago
 */
import { config } from "./env";
import { logger } from "../utils/logger";

export const mercadoPagoConfig = {
  // Credenciais
  accessToken: config.MERCADOPAGO_ACCESS_TOKEN,
  publicKey: config.MERCADOPAGO_PUBLIC_KEY,
  webhookSecret: config.MERCADOPAGO_WEBHOOK_SECRET,

  // URLs de callback
  webhookUrl: config.MERCADOPAGO_WEBHOOK_URL,
  notificationUrl: config.MERCADOPAGO_NOTIFICATION_URL,

  // URLs de redirecionamento
  successUrl: config.MERCADOPAGO_SUCCESS_URL,
  failureUrl: config.MERCADOPAGO_FAILURE_URL,
  pendingUrl: config.MERCADOPAGO_PENDING_URL,

  // Configurações gerais
  currency: "BRL",

  // Verificação de configuração
  isConfigured: !!config.MERCADOPAGO_ACCESS_TOKEN,

  // Ambiente
  isProduction: config.NODE_ENV === "production",

  // Inicializa o SDK quando necessário
  init: () => {
    if (!mercadoPagoConfig.isConfigured) {
      logger.warn(
        "Mercado Pago não configurado. Pagamentos não estarão disponíveis."
      );
      return false;
    }

    try {
      // Aqui seria adicionada a inicialização do SDK se necessário
      logger.info("Mercado Pago inicializado com sucesso.");
      return true;
    } catch (error) {
      logger.error("Erro ao inicializar Mercado Pago:", error);
      return false;
    }
  },
};
