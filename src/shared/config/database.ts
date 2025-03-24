import { PrismaClient } from "@prisma/client";
import { config } from "./env";
import { logger } from "@shared/utils/logger";

/**
 * Singleton para o cliente Prisma
 */
let prismaInstance: PrismaClient | null = null;

/**
 * Retorna a instância única do Prisma Client
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log:
        config.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });
  }
  return prismaInstance;
}

/**
 * Conecta ao banco de dados com estratégia de retry
 */
export async function connectDatabase(): Promise<void> {
  const maxRetries = config.DB_MAX_RETRIES;
  const retryDelay = config.DB_RETRY_DELAY;

  let currentRetry = 0;
  let lastError: Error | null = null;

  while (currentRetry < maxRetries) {
    try {
      const prisma = getPrismaClient();
      // Executa uma query simples para testar a conexão
      await prisma.$queryRaw`SELECT 1`;

      if (currentRetry > 0) {
        logger.info(
          `Conexão com o banco estabelecida após ${currentRetry} tentativas`
        );
      }
      return;
    } catch (error: any) {
      lastError = error;
      currentRetry++;

      logger.warn(
        `Tentativa ${currentRetry}/${maxRetries} de conexão com o banco falhou: ${error.message}`
      );

      if (currentRetry < maxRetries) {
        logger.info(`Tentando novamente em ${retryDelay}ms...`);
        // Espera antes da próxima tentativa
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  // Se chegou aqui, todas as tentativas falharam
  throw new Error(
    `Falha ao conectar ao banco de dados após ${maxRetries} tentativas: ${lastError?.message}`
  );
}

/**
 * Desconecta do banco de dados
 */
export async function disconnectDatabase(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
    logger.info("Desconectado do banco de dados");
  }
}
