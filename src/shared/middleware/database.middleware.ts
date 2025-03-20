import { Request, Response, NextFunction } from 'express';
import App from '../../app';

/**
 * Factory de middleware para verificar a conexão com o banco de dados
 * @param app Instância do App
 * @param requireConnection Se verdadeiro, bloqueia requisições quando o DB não está disponível
 */
export const databaseConnectionMiddleware = (app: any, requireConnection: boolean = false) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Se não requer conexão, apenas passa adiante
    if (!requireConnection) {
      return next();
    }
    
    // Verifica se o banco de dados está conectado
    if (!app.isDatabaseAvailable()) {
      res.status(503).json({
        status: 'error',
        message: 'Serviço temporariamente indisponível. O banco de dados não está conectado.',
        suggestion: 'Tente novamente mais tarde ou entre em contato com o suporte.'
      });
      return;
    }
    
    next();
  };
};