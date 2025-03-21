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

export { AuthService } from "./services/auth.service";
export { AuthController } from "./controllers/auth.controller";
export { UserRepository } from "./repositories/user.repository";
export { TokenUtils } from "./utils/token.utils";

export default initAuthService;
