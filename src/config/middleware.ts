import { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import express from 'express';
import path from 'path';

/**
 * Configura todos os middlewares globais da aplicação
 * @param app Instância Express
 */
export const configureMiddlewares = (app: Application): void => {
  // Segurança
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
        connectSrc: ["'self'"]
      }
    }
  }));
  
  // CORS
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  // Compressão para melhorar performance
  app.use(compression());
  
  // Limita taxa de requisições para evitar abusos
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos por padrão
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limite por IP
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
  
  // Parsing de JSON
  app.use(express.json({ limit: '1mb' }));
  
  // Parsing de dados de formulário
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  
  // Servir arquivos estáticos
  app.use(express.static(path.join(__dirname, '../../public')));
  
  // Logging básico de requisições
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
};