import { Router } from "express";
import { initJobService } from "@/services/job-service";

/**
 * Rotas de vagas no gateway
 */
const jobRoutes = Router();

jobRoutes.use("/", initJobService());

export default jobRoutes;
