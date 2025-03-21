/**
 * Middleware para tratamento global de erros
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

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
  // Log detalhado para depuração (apenas em desenvolvimento)
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${err.message}`);
    console.error(err.stack);
  } else {
    // Em produção, log mais sucinto
    console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`);
  }

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
  });
};

/**
 * Middleware para tratamento de rotas não encontradas
 * @param req Objeto de requisição do Express
 * @param res Objeto de resposta do Express
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    status: "error",
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
};

// Exportação dos middlewares
export default {
  errorHandler,
  notFoundHandler,
};
