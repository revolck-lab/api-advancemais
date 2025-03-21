import { Router } from "express";
import authRoutes from "./auth.routes";
import paymentRoutes from "./payment.routes";
import companyRoutes from "./company.routes";
import jobRoutes from "./job.routes";
import { SystemController } from "../controllers";

/**
 * Inicializa e configura as rotas da API
 * @param appInstance Instância da aplicação
 * @returns Router configurado com todas as rotas
 */
export const initApiRoutes = (appInstance: any): Router => {
  const router = Router();

  // Inicializa controladores
  const systemController = new SystemController(appInstance);

  /**
   * @swagger
   * /api/v1/version:
   *   get:
   *     summary: Retorna informações de versão da API
   *     tags: [Sistema]
   *     description: Obtém a versão atual da API e o ambiente de execução
   *     responses:
   *       200:
   *         description: Informações de versão retornadas com sucesso
   */
  router.get("/version", systemController.getVersion);

  router.use("/auth", authRoutes);
  router.use("/payments", paymentRoutes);
  router.use("/companies", companyRoutes);
  router.use("/jobs", jobRoutes);

  return router;
};

export default initApiRoutes;
