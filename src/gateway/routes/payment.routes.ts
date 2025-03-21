import { Router } from "express";
import { initPaymentService } from "@/services/payment-service";

/**
 * Rotas de pagamentos no gateway
 */
const paymentRoutes = Router();

paymentRoutes.use("/", initPaymentService());

export default paymentRoutes;
