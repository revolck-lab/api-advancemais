import { Router } from "express";
import authRoutes from "./auth.routes";
import paymentRoutes from "./payment.routes";
import companyRoutes from "./company.routes";
import jobRoutes from "./job.routes";

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
router.use("/auth", authRoutes);
router.use("/payments", paymentRoutes);
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);

export default router;
