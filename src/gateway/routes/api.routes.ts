import { Router } from "express";
import paymentRoutes from "./payment.routes";
import companyRoutes from "./company.routes"; // Nova importação
import jobRoutes from "./job.routes"; // Nova importação

/**
 * Configuração das rotas principais da API
 */
const router = Router();

// Rota de versão da API
router.get("/version", (req, res) => {
  res.status(200).json({
    status: "success",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Configurar as rotas de serviços
router.use("/payments", paymentRoutes);
router.use("/companies", companyRoutes); // Novo: rotas para empresas
router.use("/jobs", jobRoutes); // Novo: rotas para vagas

export default router;
