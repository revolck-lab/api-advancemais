const app = require("../app");
const validateEnvVariables = require("../utils/validatesEnv");
const { verifyConnection } = require("../services/emailServices");
const { testDatabaseConnection } = require("./db");
const testConnectionMercadoPago = require('../services/mercadoPagoService');

const startServer = async () => {
    try {
        // Valida variáveis de ambiente necessárias
        const variable = await validateEnvVariables([
            "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_DATABASE", "DB_PORT", 
            "JWT_SECRET", 
            "PORT", 
            "SMTP_HOST", "SMTP_PASS", "SMTP_PORT", "SMTP_USER",
            "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION", "AWS_ENDPOINT", "AWS_BUCKET_NAME",
            "FRONTEND_URL",
            "MP_ACCESS_TOKEN", "MP_PUBLIC_KEY", "MP_INTEGRATOR_ID", "MP_SECRET_KEY",
        ]);
        
        // Verifica conexão com o banco de dados
        await testDatabaseConnection();
        // Verificar conexão com o serviço de email
        await verifyConnection();
        // Verificar conexão com Mercado pago 
        await testConnectionMercadoPago(); 

        // Inicializar o servidor
        app.listen(process.env.PORT, () => {
            console.log("✅ Server Online");
        });
    } catch (error) {
        console.error("Critical error during server initialization:", error);
        process.exit(1);
    }
};

startServer();
