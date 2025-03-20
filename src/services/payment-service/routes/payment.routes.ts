import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { PaymentController } from '../controllers/payment.controller';
import app from '@/app';

/**
 * Rotas para operações de pagamentos
 */
const paymentRoutes = Router();
const prisma = app.prisma;
const paymentController = new PaymentController(prisma);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Cria um novo pagamento
 *     tags: [Pagamentos]
 *     description: Cria um novo pagamento usando o Mercado Pago
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 100.00
 *               currency:
 *                 type: string
 *                 example: BRL
 *               description:
 *                 type: string
 *                 example: Pagamento premium
 *               payment_method:
 *                 type: string
 *                 example: credit_card
 *               payment_type:
 *                 type: string
 *                 enum: [credit_card, debit_card, pix, boleto]
 *                 example: credit_card
 *               installments:
 *                 type: integer
 *                 example: 1
 *               card:
 *                 type: object
 *                 properties:
 *                   token:
 *                     type: string
 *                     example: a1b2c3d4e5f6
 *               payer:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     example: usuario@exemplo.com
 *                   identification:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: CPF
 *                       number:
 *                         type: string
 *                         example: 12345678901
 *     responses:
 *       201:
 *         description: Pagamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
paymentRoutes.post('/', app.requireDatabaseConnection, paymentController.createPayment);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Retorna detalhes de um pagamento
 *     tags: [Pagamentos]
 *     description: Busca um pagamento pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pagamento
 *     responses:
 *       200:
 *         description: Detalhes do pagamento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
paymentRoutes.get('/:id', app.requireDatabaseConnection, paymentController.getPayment);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Lista pagamentos com filtros
 *     tags: [Pagamentos]
 *     description: Retorna uma lista paginada de pagamentos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, authorized, in_process, in_mediation, rejected, cancelled, refunded, charged_back]
 *         description: Filtrar por status do pagamento
 *       - in: query
 *         name: payment_type
 *         schema:
 *           type: string
 *           enum: [credit_card, debit_card, pix, boleto, bank_transfer, wallet]
 *         description: Filtrar por tipo de pagamento
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial para filtro (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final para filtro (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de pagamentos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
paymentRoutes.get('/', app.requireDatabaseConnection, paymentController.listPayments);

/**
 * @swagger
 * /api/payments/{id}/cancel:
 *   post:
 *     summary: Cancela um pagamento pendente
 *     tags: [Pagamentos]
 *     description: Cancela um pagamento que ainda está pendente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pagamento
 *     responses:
 *       200:
 *         description: Pagamento cancelado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
paymentRoutes.post('/:id/cancel', app.requireDatabaseConnection, paymentController.cancelPayment);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   post:
 *     summary: Reembolsa um pagamento aprovado
 *     tags: [Pagamentos]
 *     description: Reembolsa um pagamento que já foi aprovado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pagamento
 *     responses:
 *       200:
 *         description: Pagamento reembolsado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
paymentRoutes.post('/:id/refund', app.requireDatabaseConnection, paymentController.refundPayment);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Webhook para notificações do Mercado Pago
 *     tags: [Pagamentos]
 *     description: Endpoint para receber notificações de pagamentos do Mercado Pago
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Notificação processada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Webhook processado com sucesso
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Assinatura do webhook inválida
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
paymentRoutes.post('/webhook', paymentController.handleWebhook);

export default paymentRoutes;