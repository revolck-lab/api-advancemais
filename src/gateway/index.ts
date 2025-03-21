/**
 * Gateway da API
 * Atua como ponto central de entrada para requisições, roteando-as para os serviços apropriados
 */

import { Router } from "express";
import initApiRoutes from "./routes/api.routes";
import {
  errorHandler,
  notFoundHandler,
} from "@/shared/middleware/error.middleware";

/**
 * Configura o Gateway da API
 * @param appInstance Instância da aplicação principal
 * @returns Router configurado com todas as rotas e middleware necessários
 */
export const configureGateway = (appInstance: any): Router => {
  const router = Router();

  // Inicializa e configura as rotas da API
  const apiRouter = initApiRoutes(appInstance);
  router.use("/", apiRouter);

  // Middleware para rotas não encontradas - DEVE SER O ÚLTIMO
  router.use("*", notFoundHandler);

  return router;
};

// Exporta o handler de erros para uso centralizado
export const handleGatewayErrors = errorHandler;

export default configureGateway;
