import { Application, Router } from "express";
import { healthRoutes } from "./health.routes";

/**
 * Configura todas as rotas da API
 */
export const setupRoutes = (app: Application) => {
  const apiRouter = Router();

  // Rotas de verificação de saúde
  apiRouter.use("/health", healthRoutes);

  // Montagem das rotas na aplicação
  app.use("/api", apiRouter);
};
