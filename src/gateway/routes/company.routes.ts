/**
 * Configuração de rotas para o serviço de empresas no API Gateway
 * Encaminha requisições para o microserviço de empresas
 */

import { Router } from "express";
import { initCompanyService } from "@/services/company-service";

/**
 * Rotas de empresas no gateway
 */
const companyRoutes = Router();

// Integra o serviço de empresas
companyRoutes.use("/", initCompanyService());

export default companyRoutes;
