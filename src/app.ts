import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import SwaggerConfig from './swagger';

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
    
    // Inicializa o Swagger
    SwaggerConfig.setup(this.app);
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
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          connectSrc: ["'self'"]
        }
      }
    }));
    
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
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutos por padrão
      limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limite por IP
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
    // Rota raiz para servir a página inicial
    this.app.get('/', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    
    // Rota de status/health check aprimorada
    this.app.get('/api/health', async (_req: Request, res: Response) => {
      try {
        // Verifica a conexão do banco de dados
        await this.prisma.$queryRaw`SELECT 1`;
        
        res.status(200).json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          database: 'connected',
          uptime: process.uptime(),
          services: {
            auth: 'available',
            payment: 'available',
            notification: 'available',
            cms: 'available'
          }
        });
      } catch (error) {
        res.status(500).json({
          status: 'error',
          timestamp: new Date().toISOString(),
          version: process.env.npm_package_version || '1.0.0',
          database: 'disconnected',
          error: process.env.NODE_ENV === 'production' ? 'Database connection error' : error
        });
      }
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