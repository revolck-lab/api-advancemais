import app from './app';
import { PrismaClient } from '@prisma/client';

/**
 * Classe Server responsável pela inicialização do servidor
 */
class Server {
  private port: number;
  private prisma: PrismaClient;
  private isDbConnected: boolean = false;
  private maxRetries: number = 5;
  private retryDelay: number = 3000; // 3 segundos

  /**
   * Inicializa a classe Server com a porta configurada
   */
  constructor() {
    this.port = parseInt(process.env.PORT || '3000', 10);
    this.prisma = app.prisma;
  }

  /**
   * Testa a conexão com o banco de dados com tentativas de reconexão
   */
  private async testDatabaseConnection(retryCount: number = 0): Promise<boolean> {
    try {
      // Executa uma query simples para testar a conexão
      await this.prisma.$queryRaw`SELECT 1`;
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
      this.isDbConnected = true;
      return true;
    } catch (error: any) {
      const dbName = this.extractDatabaseNameFromUrl();
      const errorMessage = error.message || 'Erro desconhecido';
      
      console.error(`❌ Falha ao conectar com o banco de dados (${dbName}):`, errorMessage);
      
      // Verificar se é um erro de permissão
      if (errorMessage.includes('denied access') || errorMessage.includes('Access denied')) {
        console.error('🔑 ERRO DE PERMISSÃO: O usuário não tem acesso ao banco de dados.');
        console.error('💡 Verifique se o usuário existe e possui as permissões necessárias no banco de dados.');
        
        // Tentativa de diagnóstico adicional
        this.logConnectionTroubleshooting(dbName);
        
        // Se for um erro de permissão, não fazer retry
        return false;
      }
      
      // Implementar retry com backoff exponencial
      if (retryCount < this.maxRetries) {
        const nextDelay = this.retryDelay * Math.pow(1.5, retryCount);
        console.log(`⏱️ Tentando reconectar em ${nextDelay / 1000} segundos (tentativa ${retryCount + 1}/${this.maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, nextDelay));
        return await this.testDatabaseConnection(retryCount + 1);
      }
      
      console.error('❌ Esgotadas todas as tentativas de conexão com o banco de dados.');
      return false;
    }
  }
  
  /**
   * Extrai o nome do banco de dados da URL de conexão 
   */
  private extractDatabaseNameFromUrl(): string {
    try {
      const dbUrl = process.env.DATABASE_URL || '';
      // Use regex para extrair o nome do banco após a última barra
      const matches = dbUrl.match(/\/([^\/\?]+)(\?|$)/);
      return matches && matches[1] ? matches[1] : 'desconhecido';
    } catch (error) {
      return 'desconhecido';
    }
  }
  
  /**
   * Registra informações adicionais para troubleshooting
   */
  private logConnectionTroubleshooting(dbName: string): void {
    console.log('\n📋 GUIA DE TROUBLESHOOTING DO BANCO DE DADOS:');
    console.log('1️⃣ Verifique se a variável DATABASE_URL está configurada corretamente no ambiente');
    console.log(`2️⃣ Confirme que o banco de dados '${dbName}' existe`);
    console.log('3️⃣ Verifique se o usuário no DATABASE_URL tem acesso ao banco de dados');
    console.log('4️⃣ Para MySQL/MariaDB, execute: GRANT ALL PRIVILEGES ON `' + dbName + '`.* TO \'seu_usuario\'@\'%\';');
    console.log('5️⃣ Confirme que o host do banco de dados permite conexões do Render');
    console.log('6️⃣ Se estiver usando um banco de dados gerenciado, verifique as regras de firewall\n');
  }

  /**
   * Inicializa o servidor HTTP e estabelece conexão com o banco de dados
   */
  public async start(): Promise<void> {
    try {
      // Tenta conectar ao banco de dados
      const dbConnected = await this.testDatabaseConnection();
      
      // Inicia o servidor HTTP mesmo que o banco de dados não esteja disponível
      app.app.listen(this.port, () => {
        console.log(`
        🚀 Servidor iniciado ${!dbConnected ? 'em MODO LIMITADO (sem banco de dados)' : 'com sucesso'}!
        🌐 API disponível em: http://localhost:${this.port}
        ⚙️ Ambiente: ${process.env.NODE_ENV || 'development'}
        ${dbConnected ? '🗄️ Banco de dados: Conectado' : '⚠️ Banco de dados: NÃO CONECTADO - Apenas endpoints sem dependência de DB funcionarão'}
        `);
      });
      
      // Registra o status do banco no app para uso pelos controllers
      app.setDatabaseStatus(dbConnected);

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
          // Fecha a conexão do Prisma apenas se estiver conectado
          if (this.isDbConnected) {
            await this.prisma.$disconnect();
            console.log('✅ Conexão com o banco de dados encerrada');
          }
          
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