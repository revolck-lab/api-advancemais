import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { version } from '../package.json';
import AuthMiddleware from './swagger/middleware/auth.middleware';

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
    
    // Inicializa middlewares básicos primeiro
    this.initializeBasicMiddlewares();
    
    // Configura Swagger (antes das rotas e middleware 404)
    this.setupSwagger();
    
    // Inicializa outras rotas
    this.initializeRoutes();
    
    // Inicializa tratamento de erros por último
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
      return;
    }
    next();
  }

  /**
   * Inicializa os middlewares básicos da aplicação
   */
  private initializeBasicMiddlewares(): void {
    // Segurança
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
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
   * Configura o Swagger para documentação da API
   */
  private setupSwagger(): void {
    console.log('Configurando Swagger...');
    
    // Opções básicas de configuração
    const swaggerOptions: swaggerJSDoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'AdvanceMais API',
          version: version || '1.0.0',
          description: 'Documentação da API do AdvanceMais',
          contact: {
            name: 'Suporte AdvanceMais',
            email: 'suporte@advancemais.com.br'
          },
          license: {
            name: 'Proprietária',
          },
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Servidor de Desenvolvimento',
          },
          {
            url: 'https://api-advancemais.onrender.com',
            description: 'Servidor de Produção',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
      // Caminhos para arquivos com anotações JSDoc
      apis: [
        path.join(__dirname, './swagger/schemas/*.js'),  // Arquivos compilados JS
        path.join(__dirname, './api-gateway/routes/*.js'),
        path.join(__dirname, './api-gateway/controllers/*.js'),
        path.join(__dirname, './services/**/routes/*.js'),
        path.join(__dirname, './services/**/controllers/*.js'),
      ],
    };

    try {
      // Gera a especificação Swagger
      const swaggerSpec = swaggerJSDoc(swaggerOptions);
      
      // Verifique se há credenciais no ambiente
      const hasCredentials = process.env.DOCS_USERNAME && process.env.DOCS_PASSWORD;
      if (!hasCredentials) {
        console.warn('⚠️ Aviso: Credenciais para Swagger não configuradas. A documentação ficará sem proteção.');
        console.warn('⚠️ Configure DOCS_USERNAME e DOCS_PASSWORD nas variáveis de ambiente.');
      }
      
      // Rota para documentação (com proteção por autenticação)
      this.app.use('/api-docs', (req: Request, res: Response, next: NextFunction) => {
        AuthMiddleware(req, res, next);
      }, swaggerUi.serve);
      
      // Configuração do Swagger UI
      this.app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: `
          .swagger-ui .topbar { display: none }
          body { font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; }
          .swagger-ui .btn.execute { background-color: #2ecc71; border-color: #2ecc71; }
          .swagger-ui .btn.execute:hover { background-color: #27ae60; }
        `,
        customSiteTitle: 'AdvanceMais API - Documentação',
        swaggerOptions: {
          persistAuthorization: true,
          filter: true,
          displayRequestDuration: true,
        }
      }));
      
      // Rota para acessar a especificação em formato JSON (também protegida)
      this.app.get('/api-docs.json', (req: Request, res: Response, next: NextFunction) => {
        AuthMiddleware(req, res, next);
      }, (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
      });
      
      // Adicione rotas alternativas (redirecionamento)
      this.app.get('/api/docs/v1', (_req: Request, res: Response) => {
        res.redirect('/api-docs');
      });
      
      console.log('✅ Documentação Swagger configurada com sucesso em /api-docs');
    } catch (error) {
      console.error('❌ Erro ao configurar Swagger:', error);
    }
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
          return;
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
    // Tratamento de rotas não encontradas - DEVE SER A ÚLTIMA ROTA
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