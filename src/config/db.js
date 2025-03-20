const knex = require("knex");
const dotenv = require("dotenv");
// Configura o dotenv
dotenv.config({ path: "./src/config/env/.env.development" });

// Função para criar uma instância do knex
const knexInstance = async () => {
    return databaseInstance = knex({
      client: "mysql2",
      connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        ssl: false,
      },
      pool: { min: 2, max: 10 },
    });
};

// Função para testar a conexão com o banco de dados
const testDatabaseConnection = async () => {
  try {
    const databaseInstance = await knexInstance();
    await databaseInstance.raw("SELECT 1");
    console.log("✅ Database connected successfully.");
  } catch (error) {
    console.error(`❌ [ERROR] Failed to connect to database: ${error.message}`);
    throw new Error("Database connection failed");
  }
};

// Event Listener para fechamento seguro do banco
const closeDatabaseConnection = async () => {
  if (databaseInstance) {
    try {
      await databaseInstance.destroy();
      console.log("✅ Database connection closed gracefully.");
    } catch (error) {
      console.error("❌ Error during database shutdown:", error.message);
    }
  }
};

// Eventos de encerramento
process.on("exit", closeDatabaseConnection);
process.on("SIGINT", closeDatabaseConnection);
process.on("SIGTERM", closeDatabaseConnection);

module.exports = {
  knexInstance,
  testDatabaseConnection,
};
