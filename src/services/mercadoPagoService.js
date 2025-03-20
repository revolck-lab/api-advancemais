require('dotenv').config();
const { MercadoPagoConfig, Payment, User } = require('mercadopago');

// Criando uma instância da configuração do Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

// Criando instâncias das classes necessárias
const payment = new Payment(client);
const userClient = new User(client);

// Função para testar a conexão com o Mercado Pago
const testConnectionMercadoPago = async () => {
    try {
        const response = await userClient.get();
        console.log("✅ Successful connection to Mercado Pago:");
        return response;
    } catch (error) {
        console.error('Error connecting to Mercado Pago:', error);
        throw error;
    }
};

module.exports = testConnectionMercadoPago;
