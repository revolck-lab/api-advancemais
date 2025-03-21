import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { parseConnectionString } from './utils';

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Script de diagnóstico de problemas de conexão com o banco de dados MySQL
 * Executar com: npx ts-node -r tsconfig-paths/register src/tools/database-diagnostic.ts
 */
async function diagnoseDatabase() {
  console.log('🔍 Iniciando diagnóstico da conexão de banco de dados...\n');
  
  // Verificar se DATABASE_URL está configurada
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Variável DATABASE_URL não está definida!');
    console.log('💡 SOLUÇÃO: Configure a variável DATABASE_URL no arquivo .env ou no painel de variáveis de ambiente do Render.');
    return;
  }
  
  console.log('✅ Variável DATABASE_URL está configurada');
  
  // Parsear a string de conexão
  try {
    const connectionConfig = parseConnectionString(dbUrl);
    console.log(`📊 Informações da conexão:`);
    console.log(`   - Host: ${connectionConfig.host}`);
    console.log(`   - Porta: ${connectionConfig.port}`);
    console.log(`   - Banco: ${connectionConfig.database}`);
    console.log(`   - Usuário: ${connectionConfig.user}`);
    console.log(`   - Senha: ${'*'.repeat(connectionConfig.password.length)}`);
    
    // Tentar conectar sem especificar o banco de dados (apenas ao servidor)
    console.log('\n🔄 Tentando conectar ao servidor MySQL...');
    
    try {
      const connection = await mysql.createConnection({
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.user,
        password: connectionConfig.password,
        // Não incluir o database para testar apenas a conexão com o servidor
      });
      
      console.log('✅ Conexão com o servidor MySQL estabelecida com sucesso!');
      
      // Verificar se o banco de dados existe
      console.log(`\n🔄 Verificando se o banco de dados '${connectionConfig.database}' existe...`);
      const [rows] = await connection.query(
        `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
        [connectionConfig.database]
      );
      
      const dbExists = Array.isArray(rows) && rows.length > 0;
      
      if (dbExists) {
        console.log(`✅ Banco de dados '${connectionConfig.database}' existe`);
      } else {
        console.error(`❌ Banco de dados '${connectionConfig.database}' NÃO existe!`);
        console.log(`💡 SOLUÇÃO: Crie o banco de dados com o comando: CREATE DATABASE \`${connectionConfig.database}\`;`);
        
        // Perguntar se deseja criar o banco de dados
        console.log('\n⚠️ Deseja criar o banco de dados agora? (sim/não)');
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question('> ', async (answer: string) => {
          if (answer.toLowerCase() === 'sim' || answer.toLowerCase() === 's') {
            try {
              await connection.query(`CREATE DATABASE \`${connectionConfig.database}\``);
              console.log(`✅ Banco de dados '${connectionConfig.database}' criado com sucesso!`);
            } catch (error: any) {
              console.error(`❌ Erro ao criar banco de dados: ${error.message}`);
            }
          }
          
          readline.close();
          await connection.end();
        });
        
        return;
      }
      
      // Verificar permissões do usuário
      console.log(`\n🔄 Verificando permissões do usuário '${connectionConfig.user}'...`);
      
      try {
        // Tentar conectar ao banco de dados específico
        const dbConnection = await mysql.createConnection({
          host: connectionConfig.host,
          port: connectionConfig.port,
          user: connectionConfig.user,
          password: connectionConfig.password,
          database: connectionConfig.database,
        });
        
        // Tentar executar uma query simples
        await dbConnection.query('SELECT 1');
        console.log(`✅ Usuário '${connectionConfig.user}' tem permissão para acessar o banco de dados '${connectionConfig.database}'`);
        
        // Verificar permissões específicas
        const [grantRows] = await connection.query(
          `SHOW GRANTS FOR ?@?`,
          [`${connectionConfig.user}`, `%`]
        );
        
        console.log('\n📋 Permissões do usuário:');
        (grantRows as any[]).forEach((row: any) => {
          const grantStr = Object.values(row)[0] as string;
          console.log(`   - ${grantStr}`);
        });
        
        await dbConnection.end();
      } catch (error: any) {
        console.error(`❌ Erro de permissão: ${error.message}`);
        console.log(`💡 SOLUÇÃO: Execute o seguinte comando no MySQL como administrador:`);
        console.log(`   GRANT ALL PRIVILEGES ON \`${connectionConfig.database}\`.* TO '${connectionConfig.user}'@'%';`);
        console.log(`   FLUSH PRIVILEGES;`);
        
        // Perguntar se deseja conceder as permissões
        console.log('\n⚠️ Deseja tentar conceder as permissões agora? (sim/não)');
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        readline.question('> ', async (answer: string) => {
          if (answer.toLowerCase() === 'sim' || answer.toLowerCase() === 's') {
            try {
              await connection.query(`GRANT ALL PRIVILEGES ON \`${connectionConfig.database}\`.* TO '${connectionConfig.user}'@'%'`);
              await connection.query('FLUSH PRIVILEGES');
              console.log(`✅ Permissões concedidas com sucesso!`);
            } catch (error: any) {
              console.error(`❌ Erro ao conceder permissões: ${error.message}`);
            }
          }
          
          readline.close();
          await connection.end();
        });
        
        return;
      }
      
      await connection.end();
      console.log('\n✅ Diagnóstico concluído! A conexão com o banco de dados deve funcionar corretamente.');
      
    } catch (error: any) {
      console.error(`❌ Falha ao conectar ao servidor MySQL: ${error.message}`);
      
      if (error.message.includes('Access denied')) {
        console.log('💡 CAUSA: Credenciais inválidas (usuário ou senha incorretos)');
        console.log('💡 SOLUÇÃO: Verifique o usuário e senha no DATABASE_URL');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 CAUSA: Não foi possível conectar ao host do banco de dados');
        console.log('💡 SOLUÇÃO:');
        console.log('  1. Verifique se o endereço do host está correto');
        console.log('  2. Verifique se a porta está correta (padrão MySQL: 3306)');
        console.log('  3. Para bancos de dados em cloud, verifique se o IP do Render está liberado no firewall');
      } else {
        console.log(`💡 CAUSA DESCONHECIDA: ${error.message}`);
      }
    }
    
  } catch (error: any) {
    console.error(`❌ Erro ao analisar a string de conexão: ${error.message}`);
    console.log('💡 SOLUÇÃO: Verifique o formato da string DATABASE_URL');
    console.log('   Formato esperado: mysql://usuario:senha@host:porta/banco');
  }
}

// Executa o diagnóstico
diagnoseDatabase();