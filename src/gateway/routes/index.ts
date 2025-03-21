import { Application, Router, Request, Response } from "express";
import path from "path";
import apiRoutes from "./api.routes";
import { notFoundHandler } from "../../shared/middleware/error.middleware";

/**
 * Configura todas as rotas da aplicação
 * @param app Instância Express
 * @param appInstance Instância da classe App para evitar importação cíclica
 */
export const configureRoutes = (app: Application, appInstance: any): void => {
  // Rota raiz para servir a página inicial
  app.get("/", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../../public/index.html"));
  });

  // Rota de status/health check aprimorada
  app.get("/api/health", (_req: Request, res: Response) => {
    const dbStatus = appInstance.isDatabaseAvailable()
      ? "connected"
      : "disconnected";

    const healthInfo = {
      status: appInstance.isDatabaseAvailable() ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
      uptime: process.uptime(),
      services: {
        auth: appInstance.isDatabaseAvailable() ? "available" : "unavailable",
        payment: appInstance.isDatabaseAvailable()
          ? "available"
          : "unavailable",
        notification: appInstance.isDatabaseAvailable()
          ? "available"
          : "unavailable",
        cms: appInstance.isDatabaseAvailable() ? "available" : "unavailable",
        jobs: appInstance.isDatabaseAvailable() ? "available" : "unavailable", // Novo serviço de vagas
      },
    };

    // Status 200 OK mesmo em modo degradado, mas com informações precisas
    res.status(200).json(healthInfo);
  });

  // Rota para verificar variáveis de ambiente (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    app.get("/api/debug/env", (_req: Request, res: Response) => {
      // Retorna informações seguras sem expor secrets
      const safeEnvVars = {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL
          ? "***CONFIGURADO***"
          : "***NÃO CONFIGURADO***",
        CORS_ORIGIN: process.env.CORS_ORIGIN,
      };

      res.status(200).json({
        status: "success",
        data: safeEnvVars,
      });
    });
  }

  // Configura as rotas da API
  app.use("/api/v1", apiRoutes);

  // Middleware para rotas não encontradas - DEVE SER O ÚLTIMO
  app.use(notFoundHandler);
};

export default configureRoutes;
