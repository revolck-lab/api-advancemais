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
import basicAuth from 'express-basic-auth';
import apiRoutes from './gateway/routes';

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
          imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
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
   * Configura o Swagger para documentação da API com estilo Mercado Pago
   */
  private setupSwagger(): void {
    console.log('Configurando Swagger...');
    
    // Nova URL para a documentação
    const docsUrl = '/api/v1/docs';
    
    // Opções básicas de configuração
    const swaggerOptions: swaggerJSDoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'AdvanceMais API',
          version: version || '1.0.0',
          description: 'Documentação da API do AdvanceMais, plataforma de serviços para advogados e escritórios jurídicos.',
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
        tags: [
          { name: 'Autenticação', description: 'Endpoints para autenticação e cadastro de usuários' },
          { name: 'Usuários', description: 'Gerenciamento de usuários do sistema' },
          { name: 'Empresas', description: 'Gerenciamento de empresas e escritórios jurídicos' },
          { name: 'Pagamentos', description: 'Processamento de pagamentos e assinaturas' },
          { name: 'CMS', description: 'Gerenciamento de conteúdo do site' },
        ]
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
      
      // Configuração de autenticação básica
      const username = process.env.DOCS_USERNAME || 'admin';
      const password = process.env.DOCS_PASSWORD || 'advancemais2025';
      
      // Usar Basic Auth do express-basic-auth para proteção da documentação
      const basicAuthMiddleware = basicAuth({
        users: { [username]: password },
        challenge: true,
        realm: 'Documentação da API AdvanceMais',
      });
      
      // CSS personalizado para imitar o estilo do Mercado Pago
      const customCss = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: #f8f9fa;
        }
        
        .swagger-ui .topbar {
          background-color: #2c3e50;
          padding: 10px 0;
          height: 60px;
        }
        
        .swagger-ui .info {
          margin: 30px 0;
        }
        
        .swagger-ui .info .title {
          color: #2c3e50;
          font-weight: 700;
          font-size: 28px;
        }
        
        /* Estilo lateral como Mercado Pago */
        .swagger-ui .wrapper {
          display: flex;
          padding: 0;
          max-width: 100%;
        }
        
        /* Cria uma barra lateral artificial */
        .swagger-ui .wrapper:before {
          content: "";
          display: block;
          width: 240px;
          min-width: 240px;
          background: #ffffff;
          border-right: 1px solid #e0e0e0;
          min-height: 100vh;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        /* Estiliza o conteúdo principal */
        .swagger-ui .wrapper .opblock-tag-section {
          width: calc(100% - 240px);
          box-sizing: border-box;
          padding-left: 20px;
        }
        
        /* Altera estilo dos métodos HTTP */
        .swagger-ui .opblock-get .opblock-summary-method {
          background-color: #00BCD4;
        }
        
        .swagger-ui .opblock-post .opblock-summary-method {
          background-color: #00C853;
        }
        
        .swagger-ui .opblock-put .opblock-summary-method {
          background-color: #FB8C00;
        }
        
        .swagger-ui .opblock-delete .opblock-summary-method {
          background-color: #F44336;
        }
        
        /* Blocos de operação */
        .swagger-ui .opblock {
          margin: 0 0 15px;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          border: none;
        }
        
        .swagger-ui .opblock.opblock-get {
          border-color: #00BCD4;
          background: rgba(0, 188, 212, 0.05);
        }
        
        .swagger-ui .opblock.opblock-post {
          border-color: #00C853;
          background: rgba(0, 200, 83, 0.05);
        }
        
        .swagger-ui .opblock.opblock-put {
          border-color: #FB8C00;
          background: rgba(251, 140, 0, 0.05);
        }
        
        .swagger-ui .opblock.opblock-delete {
          border-color: #F44336;
          background: rgba(244, 67, 54, 0.05);
        }
        
        /* Estilo botões */
        .swagger-ui .btn {
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .swagger-ui .btn.execute {
          background-color: #2c3e50;
          border-color: #2c3e50;
        }
        
        .swagger-ui .btn.execute:hover {
          background-color: #1a252f;
        }
        
        /* Abas laterais */
        .swagger-ui .opblock-tag {
          padding: 10px 0;
          margin: 0 0 5px;
          display: block;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .swagger-ui .opblock-tag:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .swagger-ui section.models {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
        }
        
        /* Estilo para os parâmetros */
        .swagger-ui .parameters-container {
          margin-top: 20px;
        }
        
        .swagger-ui .parameter__name {
          font-weight: 600;
          color: #2c3e50;
        }
        
        /* Estilo para os códigos */
        .swagger-ui .microlight {
          border-radius: 4px;
          padding: 10px;
          background: #f0f0f0;
        }
        
        /* Esquemas */
        .swagger-ui .model-box {
          background: rgba(0, 188, 212, 0.05);
          border-radius: 4px;
        }
        
        /* Melhorar o layout para mobile */
        @media (max-width: 768px) {
          .swagger-ui .wrapper:before {
            display: none;
          }
          
          .swagger-ui .wrapper .opblock-tag-section {
            width: 100%;
            padding-left: 0;
          }
        }
      `;
      
      // Aplica autenticação básica na rota da documentação
      this.app.use(docsUrl, basicAuthMiddleware, swaggerUi.serve);
      this.app.get(docsUrl, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: customCss,
        customSiteTitle: 'AdvanceMais API - Documentação',
        customfavIcon: '/favicon.ico',
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: 'list',
          filter: true,
          displayRequestDuration: true,
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 2,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
        }
      }));
      
      // Também protege o JSON da documentação
      this.app.get(`${docsUrl}.json`, basicAuthMiddleware, (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
      });
      
      // Redirecionar da rota anterior
      this.app.get('/api-docs', (req: Request, res: Response) => {
        res.redirect(docsUrl);
      });

      // Adicionar as rotas da API
      this.app.use(apiRoutes);
      
      console.log(`✅ Documentação Swagger configurada com sucesso em ${docsUrl}`);
      console.log(`✅ Credenciais para acesso: ${username}:${password}`);
      
      // Se estiver usando credenciais padrão, mostrar aviso
      if (!process.env.DOCS_USERNAME || !process.env.DOCS_PASSWORD) {
        console.warn('⚠️ AVISO: Usando credenciais padrão para a documentação!');
        console.warn('⚠️ Configure DOCS_USERNAME e DOCS_PASSWORD nas variáveis de ambiente para aumentar a segurança.');
      }
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