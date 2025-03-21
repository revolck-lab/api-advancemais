import { Router } from "express";
import { initCompanyService } from "@services/company-service";

/**
 * Configuração de rotas para o serviço de empresas no API Gateway
 */
const companyRoutes = Router();

// Integrar o serviço de empresas
companyRoutes.use("/", initCompanyService());

export default companyRoutes;
