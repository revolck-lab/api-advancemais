import { Router } from "express";
import jobRoutes from "./routes/job.routes";
import applicationRoutes from "./routes/application.routes";
import categoryRoutes from "./routes/category.routes";
import contractTypeRoutes from "./routes/contract-type.routes";
import workModelRoutes from "./routes/work-model.routes";
import resumeRoutes from "./routes/resume.routes";

/**
 * Inicializa o serviço de vagas e configura as rotas
 * @returns Router Express configurado com as rotas do serviço de vagas
 */
export const initJobService = (): Router => {
  const router = Router();

  console.log("✅ Serviço de Vagas inicializado com sucesso");

  // Configura as rotas principais
  router.use("/", jobRoutes);

  // Configura rotas adicionais
  router.use("/applications", applicationRoutes);
  router.use("/categories", categoryRoutes);
  router.use("/contract-types", contractTypeRoutes);
  router.use("/work-models", workModelRoutes);
  router.use("/resumes", resumeRoutes);

  return router;
};

export default initJobService;
