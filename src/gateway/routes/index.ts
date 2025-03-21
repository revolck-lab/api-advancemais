/**
 * Configuração centralizada de todas as rotas do gateway
 * Configura rotas principais, estáticas e handlers para erros
 */

import { Application, Request, Response } from "express";
import path from "path";
import { initApiRoutes } from "./api.routes";
import { notFoundHandler } from "@/shared/middleware/error.middleware";
import { SystemController } from "../controllers";

/**
 * Configura todas as rotas da aplicação
 * @param app Instância Express
 * @param appInstance Instância da classe App para evitar importação cíclica
 */
export const configureRoutes = (app: Application, appInstance: any): void => {
  // Inicializa controladores necessários
  const systemController = new SystemController(appInstance);

  // Rota raiz para servir a página inicial
  app.get("/", (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../../../public/index.html"));
  });

  /**
   * @swagger
   * /api/health:
   *   get:
   *     summary: Verifica a saúde do sistema
   *     tags: [Sistema]
   *     description: Retorna informações sobre o estado dos serviços do sistema
   *     responses:
   *       200:
   *         description: Estado do sistema retornado com sucesso
   */
  app.get("/api/health", systemController.healthCheck);

  // Rota para verificar variáveis de ambiente (apenas em desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    app.get("/api/debug/env", systemController.getEnvironmentInfo);
  }

  // Inicializa e configura as rotas da API
  const apiRouter = initApiRoutes(appInstance);
  app.use("/api/v1", apiRouter);

  // Middleware para rotas não encontradas - DEVE SER O ÚLTIMO
  app.use(notFoundHandler);
};

export default configureRoutes;
