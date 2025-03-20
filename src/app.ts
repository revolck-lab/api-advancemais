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
  private isDatabaseConnected: boolean = false;

  /**
   * Construtor privado para implementação do padrão Singleton
   */
  private constructor() {
    this.app = express();
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
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
   * Define o status da conexão com o banco de dados
   * @param isConnected Status da conexão
   */
  public setDatabaseStatus(isConnected: boolean): void {
    this.isDatabaseConnected = isConnected;
  }

  /**
   * Retorna o status da conexão com o banco de dados
   */
  public isDatabaseAvailable(): boolean {
    return this.isDatabaseConnected;
  }

  /**
   * Middleware para verificar se o banco de dados está disponível
   * Usado para endpoints que requerem acesso ao banco
   */
  public requireDatabaseConnection(req: Request, res: Response, next: NextFunction): void {
    if (!this.isDatabaseConnected) {
      res.status(503).json({
        status: 'error',
        message: 'Serviço temporariamente indisponível. O banco de dados não está conectado.',
        suggestion: 'Tente novamente mais tarde ou entre em contato com o suporte.'
      });
      return; // Importante: apenas retornar da função, não o objeto response
    }
    next();
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
      const dbStatus = this.isDatabaseConnected ? 'connected' : 'disconnected';
      
      const healthInfo = {
        status: this.isDatabaseConnected ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus,
        uptime: process.uptime(),
        services: {
          auth: this.isDatabaseConnected ? 'available' : 'unavailable',
          payment: this.isDatabaseConnected ? 'available' : 'unavailable',
          notification: this.isDatabaseConnected ? 'available' : 'unavailable',
          cms: this.isDatabaseConnected ? 'available' : 'unavailable'
        }
      };
      
      if (this.isDatabaseConnected) {
        try {
          // Verifica se a conexão ainda está ativa
          await this.prisma.$queryRaw`SELECT 1`;
        } catch (error) {
          healthInfo.status = 'degraded';
          healthInfo.database = 'error';
          this.isDatabaseConnected = false;
          
          res.status(500).json({
            ...healthInfo,
            error: process.env.NODE_ENV === 'production' ? 'Database connection error' : error
          });
          return; // Return early sem retornar o objeto response
        }
      }
      
      // Status 200 OK mesmo em modo degradado, mas com informações precisas
      res.status(200).json(healthInfo);
    });

    // Rota para verificar variáveis de ambiente (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      this.app.get('/api/debug/env', (_req: Request, res: Response) => {
        // Retorna informações seguras sem expor secrets
        const safeEnvVars = {
          NODE_ENV: process.env.NODE_ENV,
          PORT: process.env.PORT,
          DATABASE_URL: process.env.DATABASE_URL ? '***CONFIGURADO***' : '***NÃO CONFIGURADO***',
          CORS_ORIGIN: process.env.CORS_ORIGIN,
          // Não inclua variáveis sensíveis como JWT_SECRET
        };
        
        res.status(200).json({
          status: 'success',
          data: safeEnvVars
        });
      });
    }

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