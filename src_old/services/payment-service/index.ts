import { Router } from 'express';
import paymentRoutes from './routes/payment.routes';
import subscriptionRoutes from './routes/subscription.routes';
import { createMercadoPagoClient } from '@shared/config/mercadopago';

/**
 * Inicializa o serviço de pagamentos e configura as rotas
 * @returns Router Express configurado com as rotas do serviço de pagamentos
 */
export const initPaymentService = (): Router => {
  const router = Router();

  // Inicializa o SDK do Mercado Pago
  try {
    createMercadoPagoClient();
    console.log('✅ Serviço de Pagamentos inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar o serviço de pagamentos:', error);
    console.error('⚠️ As operações de pagamento podem não funcionar corretamente.');
  }

  // Configura as rotas
  router.use('/payments', paymentRoutes);
  router.use('/subscriptions', subscriptionRoutes);

  return router;
};

export default initPaymentService;