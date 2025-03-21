// src/shared/middleware/error.middleware.ts

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { ErrorLogger } from "../utils/error-logger";

// Instância do logger
const logger = ErrorLogger.getInstance();

/**
 * Middleware para tratamento centralizado de erros
 * @param err Erro capturado
 * @param req Objeto de requisição do Express
 * @param res Objeto de resposta do Express
 * @param next Função para passar para o próximo middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Registrar o erro no sistema de logging centralizado
  logger.logError(err, "ErrorMiddleware", req);

  // Verifica se é um erro da aplicação (AppError)
  if (err instanceof AppError) {
    // Estrutura de resposta para erros da aplicação
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  // Tratamento de erros do Prisma
  if (
    err.name === "PrismaClientKnownRequestError" ||
    err.name === "PrismaClientValidationError"
  ) {
    res.status(400).json({
      status: "error",
      message: "Erro de validação ou consulta inválida",
      details: process.env.NODE_ENV !== "production" ? err.message : undefined,
    });
    return;
  }

  // Tratamento genérico para outros tipos de erro
  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Erro interno do servidor"
        : err.message,
    requestId: req.headers["x-request-id"] || undefined,
  });
};

/**
 * Middleware para tratamento de rotas não encontradas
 * @param req Objeto de requisição do Express
 * @param res Objeto de resposta do Express
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  logger.logWarning(
    `Rota não encontrada: ${req.method} ${req.originalUrl}`,
    "RouteNotFound",
    {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    }
  );

  res.status(404).json({
    status: "error",
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Middleware para adicionar um ID de requisição único
 * Útil para rastreamento de erros em logs
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId =
    req.headers["x-request-id"] ||
    `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  req.headers["x-request-id"] = requestId as string;
  res.setHeader("X-Request-ID", requestId);
  next();
};

// Exportação dos middlewares
export default {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
};
