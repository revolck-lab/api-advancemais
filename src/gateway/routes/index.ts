import { Router } from 'express';
import paymentRoutes from './payment.routes';
// Importar outras rotas aqui quando forem criadas

/**
 * Configuração de rotas para a API
 */
const routes = Router();

// Rota de health check para verificar se a API está funcionando
routes.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Versão da API
routes.get('/version', (req, res) => {
  res.status(200).json({
    status: 'success',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configurar as rotas de pagamento
routes.use('/api/v1', paymentRoutes);
// Adicionar outras rotas aqui quando forem criadas

export default routes;