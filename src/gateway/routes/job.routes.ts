/**
 * Configuração de rotas para o serviço de vagas no API Gateway
 * Encaminha requisições para o microserviço de vagas
 */

import { Router } from "express";
import { initJobService } from "@/services/job-service";

/**
 * Rotas de vagas no gateway
 */
const jobRoutes = Router();

// Integra o serviço de vagas
jobRoutes.use("/", initJobService());

export default jobRoutes;
