/**
 * Serviço de Autenticação
 * Gerencia autenticação, autorização e gerenciamento de usuários
 */

import { Router } from "express";
import authRoutes from "./routes/auth.routes";

/**
 * Inicializa o serviço de autenticação e configura as rotas
 * @returns Router Express configurado com as rotas de autenticação
 */
export const initAuthService = (): Router => {
  const router = Router();

  console.log("✅ Serviço de Autenticação inicializado com sucesso");

  // Configura as rotas de autenticação
  router.use("/", authRoutes);

  return router;
};

export default initAuthService;
