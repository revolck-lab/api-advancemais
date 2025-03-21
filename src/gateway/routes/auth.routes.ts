/**
 * Configuração de rotas para o serviço de autenticação no API Gateway
 * Encaminha requisições para o microserviço de autenticação
 */

import { Router } from "express";
import { initAuthService } from "@services/auth-service";

/**
 * Rotas de autenticação no gateway
 */
const authRoutes = Router();

// Integra o serviço de autenticação
authRoutes.use("/", initAuthService());

export default authRoutes;
