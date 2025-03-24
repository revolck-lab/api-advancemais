import { Request, Response, NextFunction } from "express";
import { logger } from "@shared/utils/logger";
import { config } from "@shared/config/env";

/**
 * Classe para erros da API com status code
 */
export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Middleware global de tratamento de erros
 */
export const errorMiddleware = (
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Valor padrão para o status code
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const message = error.message || "Erro interno do servidor";
  const details = error instanceof ApiError ? error.details : undefined;

  // Log do erro
  const logMessage = `[${statusCode}] ${message}${
    req.originalUrl ? ` (${req.method} ${req.originalUrl})` : ""
  }`;

  if (statusCode >= 500) {
    logger.error(logMessage, error);
  } else {
    logger.warn(logMessage);
  }

  // Resposta ao cliente
  const errorResponse: any = {
    status: "error",
    message,
  };

  // Em desenvolvimento, incluir stack e detalhes
  if (config.NODE_ENV !== "production") {
    errorResponse.stack = error.stack;
    if (details) {
      errorResponse.details = details;
    }
  }

  res.status(statusCode).json(errorResponse);
};
