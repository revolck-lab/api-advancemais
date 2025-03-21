import express, { Application } from "express";
import { PrismaClient } from "@prisma/client";
import { configureMiddlewares } from "./config/middleware";
import { configureSwagger } from "./config/swagger";
import { configureRoutes } from "./gateway/routes";
import { errorHandler } from "./shared/middleware/error.middleware";
import { databaseConnectionMiddleware } from "./shared/middleware/database.middleware";

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
  public requireDatabaseConnection = databaseConnectionMiddleware(this, true);
}

// Exporta a instância única da aplicação
export default App.getInstance();
