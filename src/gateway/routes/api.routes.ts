import { Router } from 'express';
import paymentRoutes from './payment.routes';

/**
 * Configuração das rotas principais da API
 */
const router = Router();

// Rota de versão da API
router.get('/version', (req, res) => {
  res.status(200).json({
    status: 'success',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configurar as rotas de pagamento
router.use('/payments', paymentRoutes);

export default router;