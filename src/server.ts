import { app } from "./app";
import { config } from "@shared/config/env";
import { logger } from "@shared/utils/logger";
import { connectDatabase } from "@shared/config/database";

const PORT = config.PORT || 3000;

/**
 * Inicializa o servidor e conexões
 */
async function startServer() {
  try {
    // Tentar conectar ao banco de dados (a menos que esteja em modo sem DB)
    if (!config.ALLOW_NO_DB_MODE) {
      await connectDatabase();
      logger.info("🔌 Conexão com o banco de dados estabelecida");
    } else {
      logger.warn(
        "🚫 Rodando em modo sem banco de dados. Funcionalidades de banco estarão indisponíveis."
      );
    }

    // Iniciar o servidor
    app.listen(PORT, () => {
      logger.info(
        `🚀 Servidor rodando na porta ${PORT} em modo ${config.NODE_ENV}`
      );
      logger.info(
        `🔍 Verificação de saúde disponível em: http://localhost:${PORT}/api/health`
      );
      logger.info(
        `📚 Documentação disponível em: http://localhost:${PORT}/api/v1/docs`
      );
    });
  } catch (error) {
    logger.error("❌ Falha ao iniciar o servidor:", error);
    process.exit(1);
  }
}

// Iniciar o servidor
startServer();

// Tratamento de exceções não capturadas
process.on("uncaughtException", (error) => {
  logger.error("❌ Exceção não capturada:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("❌ Rejeição não tratada:", reason);
  // Não encerramos o processo aqui para permitir recuperação
});
