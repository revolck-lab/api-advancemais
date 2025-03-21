// src/services/company-service/index.ts

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

// Exportações de classes e interfaces específicas para uso em outros serviços
export { CompanyService } from "./services/company.service";
export { SubscriptionService } from "./services/subscription.service";
export { CompanyController } from "./controllers/company.controller";
export { SubscriptionController } from "./controllers/subscription.controller";
export { CompanyRepository } from "./repositories/company.repository";
export { SubscriptionRepository } from "./repositories/subscription.repository";

// Exportações de tipos e interfaces
export * from "./interfaces/company.interface";
export * from "./interfaces/subscription.interface";

export default initCompanyService;
