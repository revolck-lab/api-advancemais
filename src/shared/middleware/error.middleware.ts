import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para tratamento global de erros
 */
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  console.error(err.stack);
  
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message
  });
};

/**
 * Middleware para tratamento de rotas não encontradas
 */
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Rota não encontrada'
  });
};