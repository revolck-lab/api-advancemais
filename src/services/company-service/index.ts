import { Router } from "express";
import companyRoutes from "./routes/company.routes";
import subscriptionRoutes from "./routes/subscription.routes";

/**
 * Inicializa o serviço de empresas e configura as rotas
 * @returns Router Express configurado com as rotas do serviço de empresas
 */
export const initCompanyService = (): Router => {
  const router = Router();

  console.log("✅ Serviço de Empresas inicializado com sucesso");

  // Configura as rotas
  router.use("/", companyRoutes);
  router.use("/subscriptions", subscriptionRoutes);

  return router;
};

export default initCompanyService;
