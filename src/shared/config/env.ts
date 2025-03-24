import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Interface para tipagem das variáveis de ambiente
 */
interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  CORS_ORIGIN: string | string[];
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  BCRYPT_SALT_ROUNDS: number;
  DOCS_USERNAME: string;
  DOCS_PASSWORD: string;
  LOG_LEVEL: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX: number;
  ALLOW_NO_DB_MODE: boolean;
  DB_MAX_RETRIES: number;
  DB_RETRY_DELAY: number;
  // Mercado Pago configs
  MERCADOPAGO_ACCESS_TOKEN?: string;
  MERCADOPAGO_PUBLIC_KEY?: string;
  MERCADOPAGO_WEBHOOK_SECRET?: string;
  MERCADOPAGO_WEBHOOK_URL?: string;
  MERCADOPAGO_NOTIFICATION_URL?: string;
  MERCADOPAGO_SUCCESS_URL?: string;
  MERCADOPAGO_FAILURE_URL?: string;
  MERCADOPAGO_PENDING_URL?: string;
}

/**
 * Parse e validação das variáveis de ambiente
 */
export const config: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : "http://localhost:3000",
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET:
    process.env.JWT_SECRET || "desenvolvimento-secret-nao-use-em-producao",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
  DOCS_USERNAME: process.env.DOCS_USERNAME || "admin",
  DOCS_PASSWORD: process.env.DOCS_PASSWORD || "admin",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10
  ),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  ALLOW_NO_DB_MODE: process.env.ALLOW_NO_DB_MODE === "true",
  DB_MAX_RETRIES: parseInt(process.env.DB_MAX_RETRIES || "5", 10),
  DB_RETRY_DELAY: parseInt(process.env.DB_RETRY_DELAY || "3000", 10),
  // Mercado Pago configs
  MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY,
  MERCADOPAGO_WEBHOOK_SECRET: process.env.MERCADOPAGO_WEBHOOK_SECRET,
  MERCADOPAGO_WEBHOOK_URL: process.env.MERCADOPAGO_WEBHOOK_URL,
  MERCADOPAGO_NOTIFICATION_URL: process.env.MERCADOPAGO_NOTIFICATION_URL,
  MERCADOPAGO_SUCCESS_URL: process.env.MERCADOPAGO_SUCCESS_URL,
  MERCADOPAGO_FAILURE_URL: process.env.MERCADOPAGO_FAILURE_URL,
  MERCADOPAGO_PENDING_URL: process.env.MERCADOPAGO_PENDING_URL,
};

// Validação básica das variáveis necessárias para produção
if (config.NODE_ENV === "production") {
  const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(
        `Erro: Variável de ambiente ${envVar} é obrigatória em modo de produção.`
      );
      process.exit(1);
    }
  }
}
