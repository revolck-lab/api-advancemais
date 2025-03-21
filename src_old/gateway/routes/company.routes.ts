import { Router } from "express";
import { initCompanyService } from "@/services/company-service";

/**
 * Rotas de empresas no gateway
 */
const companyRoutes = Router();

companyRoutes.use("/", initCompanyService());

export default companyRoutes;
