/**
 * Configuração de rotas para o serviço de autenticação no API Gateway
 */

import { Router } from "express";
import { initAuthService } from "@services/auth-service";

/**
 * Rotas de autenticação no gateway
 */
const authRoutes = Router();

// Integrar o serviço de autenticação
authRoutes.use("/", initAuthService());

export default authRoutes;
