import { Router } from 'express';
import { initPaymentService } from '@services/payment-service';

/**
 * Configuração de rotas para o serviço de pagamentos no API Gateway
 */
const paymentRoutes = Router();

// Integrar o serviço de pagamentos
paymentRoutes.use('/', initPaymentService());

export default paymentRoutes;