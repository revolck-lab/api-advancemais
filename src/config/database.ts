import { PrismaClient } from "@prisma/client";

/**
 * Configurações do cliente Prisma
 */
const prismaConfig = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  errorFormat: "pretty",
};

/**
 * Classe para gerenciar a conexão do banco de dados
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private _prisma: PrismaClient;
  private _isConnected: boolean = false;
  private _maxRetries: number = parseInt(process.env.DB_MAX_RETRIES || "5", 10);
  private _retryDelay: number = parseInt(
    process.env.DB_RETRY_DELAY || "3000",
    10
  );

  /**
   * Construtor privado para implementação do padrão Singleton
   */
  private constructor() {
    this._prisma = new PrismaClient(prismaConfig);
  }

  /**
   * Retorna a instância única da conexão do banco de dados
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Acesso ao cliente Prisma
   */
  public get prisma(): PrismaClient {
    return this._prisma;
  }

  /**
   * Verifica se o banco de dados está conectado
   */
  public isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * Inicializa a conexão com o banco de dados, com tentativas de reconexão
   * @returns true se conectado com sucesso, false caso contrário
   */
  public async connect(retryCount: number = 0): Promise<boolean> {
    try {
      // Executa uma query simples para testar a conexão
      await this._prisma.$queryRaw`SELECT 1`;
      console.log("✅ Conexão com o banco de dados estabelecida com sucesso");
      this._isConnected = true;
      return true;
    } catch (error: any) {
      const dbName = this.extractDatabaseNameFromUrl();
      const errorMessage = error.message || "Erro desconhecido";

      console.error(
        `❌ Falha ao conectar com o banco de dados (${dbName}):`,
        errorMessage
      );

      // Verifica se é um erro de permissão
      if (
        errorMessage.includes("denied access") ||
        errorMessage.includes("Access denied")
      ) {
        console.error(
          "🔑 ERRO DE PERMISSÃO: O usuário não tem acesso ao banco de dados."
        );
        this.logConnectionTroubleshooting(dbName);
        return false;
      }

      // Implementar retry com backoff exponencial
      if (retryCount < this._maxRetries) {
        const nextDelay = this._retryDelay * Math.pow(1.5, retryCount);
        console.log(
          `⏱️ Tentando reconectar em ${nextDelay / 1000} segundos (tentativa ${
            retryCount + 1
          }/${this._maxRetries})...`
        );

        await new Promise((resolve) => setTimeout(resolve, nextDelay));
        return this.connect(retryCount + 1);
      }

      console.error(
        "❌ Esgotadas todas as tentativas de conexão com o banco de dados."
      );
      return false;
    }
  }

  /**
   * Encerra a conexão com o banco de dados
   */
  public async disconnect(): Promise<void> {
    if (this._isConnected) {
      await this._prisma.$disconnect();
      this._isConnected = false;
      console.log("✅ Conexão com o banco de dados encerrada");
    }
  }

  /**
   * Extrai o nome do banco de dados da URL de conexão
   */
  private extractDatabaseNameFromUrl(): string {
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      const matches = dbUrl.match(/\/([^\/\?]+)(\?|$)/);
      return matches && matches[1] ? matches[1] : "desconhecido";
    } catch (error) {
      return "desconhecido";
    }
  }

  /**
   * Registra informações adicionais para troubleshooting
   */
  private logConnectionTroubleshooting(dbName: string): void {
    console.log("\n📋 GUIA DE TROUBLESHOOTING DO BANCO DE DADOS:");
    console.log(
      "1️⃣ Verifique se a variável DATABASE_URL está configurada corretamente"
    );
    console.log(`2️⃣ Confirme que o banco de dados '${dbName}' existe`);
    console.log(
      "3️⃣ Verifique se o usuário no DATABASE_URL tem acesso ao banco de dados"
    );
    console.log("4️⃣ Execute o diagnóstico com: npm run db:diagnose\n");
  }
}

export const db = DatabaseConnection.getInstance();
