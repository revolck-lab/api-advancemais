/**
 * Centraliza a importação e exportação de middleware específico do gateway
 * Facilita o gerenciamento e uso consistente de middleware em toda a aplicação
 */

import authMiddleware from "@/shared/middleware/auth.middleware";
import {
  errorHandler,
  notFoundHandler,
} from "@/shared/middleware/error.middleware";
import { databaseConnectionMiddleware } from "@/shared/middleware/database.middleware";

// Exporta todos os middlewares individualmente
export {
  authMiddleware,
  errorHandler,
  notFoundHandler,
  databaseConnectionMiddleware,
};

// Exporta todos os middlewares como um objeto agrupado
export default {
  auth: authMiddleware,
  error: errorHandler,
  notFound: notFoundHandler,
  database: databaseConnectionMiddleware,
};
