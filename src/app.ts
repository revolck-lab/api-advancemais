import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Classe App para configuração da aplicação Express
 * Utiliza o padrão Singleton para garantir uma única instância
 */
class App {
  public app: Application;
  public prisma: PrismaClient;
  private static instance: App;

  /**
   * Construtor privado para implementação do padrão Singleton
   */
  private constructor() {
    this.app = express();
    this.prisma = new PrismaClient();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  /**
   * Retorna a instância única da aplicação
   */
  public static getInstance(): App {
    if (!App.instance) {
      App.instance = new App();
    }
    return App.instance;
  }

  /**
   * Inicializa os middlewares globais da aplicação
   */
  private initializeMiddlewares(): void {
    // Segurança
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Compressão para melhorar performance
    this.app.use(compression());
    
    // Limita taxa de requisições para evitar abusos
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      limit: 100, // limite de 100 requisições por IP
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);
    
    // Parsing de JSON
    this.app.use(express.json({ limit: '1mb' }));
    
    // Parsing de dados de formulário
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    
    // Servir arquivos estáticos
    this.app.use(express.static(path.join(__dirname, '../public')));
    
    // Logging básico de requisições
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
      next();
    });
  }

  /**
   * Inicializa as rotas da API
   * Aqui serão importadas as rotas definidas em api-gateway/routes
   */
  private initializeRoutes(): void {
    // Rota de status/health check
    this.app.get('/api/health', (_req: Request, res: Response) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // TODO: Importar e usar as rotas principais conforme elas forem criadas
    // Exemplo: this.app.use('/api/auth', authRoutes);
  }

  /**
   * Inicializa o tratamento global de erros
   */
  private initializeErrorHandling(): void {
    // Tratamento de rotas não encontradas
    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({
        status: 'error',
        message: 'Rota não encontrada'
      });
    });

    // Middleware de tratamento de erros
    this.app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
      console.error(`[ERROR] ${err.message}`);
      console.error(err.stack);
      
      res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
          ? 'Erro interno do servidor' 
          : err.message
      });
    });
  }
}

// Exporta a instância única da aplicação
export default App.getInstance();