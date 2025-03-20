import app from './app';
import { PrismaClient } from '@prisma/client';

/**
 * Classe Server responsável pela inicialização do servidor
 */
class Server {
  private port: number;
  private prisma: PrismaClient;

  /**
   * Inicializa a classe Server com a porta configurada
   */
  constructor() {
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.prisma = app.prisma;
  }

  /**
   * Testa a conexão com o banco de dados
   */
  private async testDatabaseConnection(): Promise<void> {
    try {
      // Executa uma query simples para testar a conexão
      await this.prisma.$queryRaw`SELECT 1`;
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
    } catch (error) {
      console.error('❌ Falha ao conectar com o banco de dados:', error);
      process.exit(1);
    }
  }

  /**
   * Inicializa o servidor HTTP e estabelece conexão com o banco de dados
   */
  public async start(): Promise<void> {
    try {
      // Testa a conexão com o banco
      await this.testDatabaseConnection();

      // Inicia o servidor HTTP
      app.app.listen(this.port, () => {
        console.log(`
        🚀 Servidor iniciado com sucesso!
        🌐 API disponível em: http://localhost:${this.port}
        ⚙️ Ambiente: ${process.env.NODE_ENV || 'development'}
        `);
      });

      // Configura tratamento de sinais para encerramento gracioso
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('❌ Falha ao iniciar o servidor:', error);
      process.exit(1);
    }
  }

  /**
   * Configura o encerramento gracioso do servidor
   */
  private setupGracefulShutdown(): void {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        console.log(`\n🛑 Recebido sinal ${signal}, encerrando servidor...`);
        
        try {
          // Fecha a conexão do Prisma
          await this.prisma.$disconnect();
          console.log('✅ Conexão com o banco de dados encerrada');
          
          // Encerra o processo com sucesso
          process.exit(0);
        } catch (error) {
          console.error('❌ Erro ao encerrar conexões:', error);
          process.exit(1);
        }
      });
    });
  }
}

// Inicializa e executa o servidor
const server = new Server();
server.start().catch(error => {
  console.error('❌ Erro fatal ao iniciar o servidor:', error);
  process.exit(1);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  console.error('❌ Exceção não capturada:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promessa rejeitada não tratada:', reason);
});