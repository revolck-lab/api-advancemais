import { Router } from "express";
import { initJobService } from "@services/job-service";

/**
 * Configuração de rotas para o serviço de vagas no API Gateway
 */
const jobRoutes = Router();

// Integrar o serviço de vagas
jobRoutes.use("/", initJobService());

export default jobRoutes;
