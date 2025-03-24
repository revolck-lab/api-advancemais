import { Application, Router } from "express";
import { healthRoutes } from "./health.routes";
import { emailRoutes } from "@services/notification-service/routes/email.routes";
import { initNotificationService } from "@services/notification-service";
import { logger } from "@shared/utils/logger";

/**
 * Configura todas as rotas da API
 */
export const setupRoutes = (app: Application) => {
  const apiRouter = Router();
  const v1Router = Router();

  // Inicializar serviços
  try {
    initNotificationService();
  } catch (error) {
    logger.error("Erro ao inicializar serviços:", error);
  }

  // Rotas de verificação de saúde
  apiRouter.use("/health", healthRoutes);

  // Rotas da versão 1 da API
  apiRouter.use("/v1", v1Router);

  // Serviço de Email
  v1Router.use("/email", emailRoutes);

  // Montagem das rotas na aplicação
  app.use("/api", apiRouter);
};
