/**
 * Configurações gerais do servidor
 */
import { config } from "./env";

export const serverConfig = {
  // Configurações gerais do servidor
  port: config.PORT,
  env: config.NODE_ENV,

  // Configurações de API
  apiPrefix: "/api",
  apiVersion: "v1",
  apiFullPrefix: "/api/v1",

  // Configurações de documentação
  docsPath: "/api/v1/docs",
  docsCredentials: {
    username: config.DOCS_USERNAME,
    password: config.DOCS_PASSWORD,
  },

  // Configurações de tempo limite
  requestTimeout: 30000, // 30 segundos

  // Configurações de upload
  maxUploadSize: "10mb",

  // Configurações de cookies
  cookieSecret: config.JWT_SECRET,
  cookieMaxAge: 24 * 60 * 60 * 1000, // 1 dia

  // Configurações de resiliência
  shutdownTimeout: 5000, // 5 segundos para shutdown gracioso
};
