import { Router } from "express";
import { initAuthService } from "@services/auth-service";

/**
 * Rotas de autenticação no gateway
 */
const authRoutes = Router();

authRoutes.use("/", initAuthService());

export default authRoutes;
