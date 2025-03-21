/**
 * Configuração de rotas para o serviço de pagamentos no API Gateway
 * Encaminha requisições para o microserviço de pagamentos
 */

import { Router } from "express";
import { initPaymentService } from "@/services/payment-service";

/**
 * Rotas de pagamentos no gateway
 */
const paymentRoutes = Router();

// Integra o serviço de pagamentos
paymentRoutes.use("/", initPaymentService());

export default paymentRoutes;
