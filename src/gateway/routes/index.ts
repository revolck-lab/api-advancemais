import { Application, Router } from "express";
import { healthRoutes } from "./health.routes";
import { simplifiedEmailRoutes } from "@services/notification-service/routes/simplified-email.routes";
import { logger } from "@shared/utils/logger";

/**
 * Configura todas as rotas da API
 */
export const setupRoutes = (app: Application) => {
  const apiRouter = Router();
  const v1Router = Router();

  // Inicializar serviços (sem dependência estrita para não falhar na inicialização)
  try {
    // Carrega apenas as rotas, a inicialização do serviço acontece sob demanda
    logger.info("Serviços configurados com inicialização sob demanda");
  } catch (error) {
    logger.error("Erro ao configurar serviços:", error);
    logger.info(
      "Continuando inicialização da API mesmo com erros nos serviços"
    );
  }

  // Rotas de verificação de saúde
  apiRouter.use("/health", healthRoutes);

  // Rotas da versão 1 da API
  apiRouter.use("/v1", v1Router);

  // Serviço de Email (versão simplificada)
  v1Router.use("/email", simplifiedEmailRoutes);

  // Montagem das rotas na aplicação
  app.use("/api", apiRouter);

  // Rota para página inicial
  app.get("/", (req, res) => {
    res.send(
      "API AdvanceMais - Versão " + process.env.npm_package_version || "1.0.0"
    );
  });

  // Rota para tratamento de 404
  app.use((req, res) => {
    res.status(404).json({
      status: "error",
      message: "Rota não encontrada",
    });
  });
};
