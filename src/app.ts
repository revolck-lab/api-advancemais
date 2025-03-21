// src/app.ts (modificações)

import express, { Application } from "express";
import { PrismaClient } from "@prisma/client";
import { configureMiddlewares } from "./config/middleware";
import { configureSwagger } from "./config/swagger";
import { configureRoutes } from "./gateway/routes";
import {
  errorHandler,
  requestIdMiddleware,
} from "./shared/middleware/error.middleware";
import { databaseConnectionMiddleware } from "./shared/middleware/database.middleware";
import { ICache, MemoryCache, RedisCache } from "./shared/utils/cache";
import { ErrorLogger } from "./shared/utils/error-logger";

/**
 * Classe App para configuração da aplicação Express
 * Utiliza o padrão Singleton para garantir uma única instância
 */
class App {
  public app: Application;
  public prisma: PrismaClient;
  private static instance: App;
  private isDatabaseConnected: boolean = false;
  public cache: ICache;
  private logger = ErrorLogger.getInstance();

  /**
   * Construtor privado para implementação do padrão Singleton
   */
  private constructor() {
    this.app = express();

    // Inicializar o logger primeiro para capturar erros de inicialização
    this.logger.logInfo("Inicializando aplicação", "App");

    // Inicializar serviço de cache
    this.cache = this.initializeCache();

    // Inicializar o cliente Prisma
    this.prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
      errorFormat: "pretty",
    });

    this.initializeApplication();
  }

  /**
   * Inicializa todos os componentes da aplicação em ordem apropriada
   */
  private initializeApplication(): void {
    try {
      // Adicionar middleware de ID de requisição para rastreamento
      this.app.use(requestIdMiddleware);

      // Inicializa middlewares básicos
      configureMiddlewares(this.app);

      // Configura o middleware de verificação de banco de dados
      this.app.use(databaseConnectionMiddleware(this));

      // Configura Swagger para documentação
      configureSwagger(this.app);

      // Configura as rotas da API - passa a instância do App para evitar importação cíclica
      configureRoutes(this.app, this);

      // Configura tratamento de erros (deve ser o último middleware)
      this.app.use(errorHandler);

      this.logger.logInfo("Aplicação inicializada com sucesso", "App");
    } catch (error) {
      this.logger.logFatal(error as Error, "App.initializeApplication");
      throw error;
    }
  }

  /**
   * Inicializa o serviço de cache apropriado baseado no ambiente
   * @returns Instância de cache configurada
   */
  private initializeCache(): ICache {
    try {
      // Se REDIS_URL estiver configurado, usa Redis, caso contrário, usa cache em memória
      if (process.env.REDIS_URL) {
        this.logger.logInfo("Inicializando cache Redis", "App", {
          url: process.env.REDIS_URL.replace(/:[^:]*@/, ":****@"),
        });

        return new RedisCache(
          process.env.REDIS_URL,
          parseInt(process.env.CACHE_DEFAULT_TTL || "3600", 10),
          process.env.CACHE_PREFIX || "app:"
        );
      } else {
        this.logger.logInfo("Inicializando cache em memória", "App");

        return new MemoryCache(
          parseInt(process.env.CACHE_DEFAULT_TTL || "3600", 10),
          parseInt(process.env.CACHE_CLEANUP_INTERVAL || "60000", 10)
        );
      }
    } catch (error) {
      this.logger.logError(error as Error, "App.initializeCache");

      // Em caso de erro, usa cache em memória como fallback
      this.logger.logWarning(
        "Usando cache em memória como fallback devido a erro",
        "App"
      );
      return new MemoryCache();
    }
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

    // Registrar evento de status do banco de dados
    this.logger.logInfo(
      `Status da conexão com o banco de dados: ${
        isConnected ? "Conectado" : "Desconectado"
      }`,
      "App.setDatabaseStatus"
    );
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
  public requireDatabaseConnection = databaseConnectionMiddleware(this, true);
}

// Exporta a instância única da aplicação
export default App.getInstance();
