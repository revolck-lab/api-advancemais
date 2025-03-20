import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { SubscriptionController } from '../controllers/subscription.controller';
import app from '@/app';

/**
 * Rotas para operações de assinaturas
 */
const subscriptionRoutes = Router();
const prisma = app.prisma;
const subscriptionController = new SubscriptionController(prisma);

/**
 * @swagger
 * /api/subscriptions:
 *   post:
 *     summary: Cria uma nova assinatura
 *     tags: [Assinaturas]
 *     description: Cria uma nova assinatura usando o Mercado Pago
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
 *               plan_id:
 *                 type: string
 *                 example: plan_123456789
 *               payment_method_id:
 *                 type: string
 *                 example: credit_card
 *               auto_recurring:
 *                 type: boolean
 *                 example: true
 *               frequency:
 *                 type: integer
 *                 example: 1
 *               frequency_type:
 *                 type: string
 *                 enum: [days, months, years]
 *                 example: months
 *               card_token:
 *                 type: string
 *                 example: a1b2c3d4e5f6
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
 *         description: Assinatura criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
subscriptionRoutes.post('/', app.requireDatabaseConnection, subscriptionController.createSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}:
 *   get:
 *     summary: Retorna detalhes de uma assinatura
 *     tags: [Assinaturas]
 *     description: Busca uma assinatura pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da assinatura
 *     responses:
 *       200:
 *         description: Detalhes da assinatura
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
subscriptionRoutes.get('/:id', app.requireDatabaseConnection, subscriptionController.getSubscription);

/**
 * @swagger
 * /api/subscriptions/user/{userId}/active:
 *   get:
 *     summary: Retorna a assinatura ativa de um usuário
 *     tags: [Assinaturas]
 *     description: Busca a assinatura ativa de um usuário pelo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Detalhes da assinatura ativa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       404:
 *         description: Usuário não possui assinatura ativa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
subscriptionRoutes.get('/user/:userId/active', app.requireDatabaseConnection, subscriptionController.getActiveSubscription);

/**
 * @swagger
 * /api/subscriptions/user/{userId}/check:
 *   get:
 *     summary: Verifica se um usuário possui assinatura ativa
 *     tags: [Assinaturas]
 *     description: Verifica se o usuário possui assinatura ativa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Resultado da verificação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasActiveSubscription:
 *                       type: boolean
 *                       example: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
subscriptionRoutes.get('/user/:userId/check', app.requireDatabaseConnection, subscriptionController.checkUserSubscription);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Lista assinaturas com filtros
 *     tags: [Assinaturas]
 *     description: Retorna uma lista paginada de assinaturas
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
 *           enum: [pending, authorized, active, paused, cancelled, ended, payment_failed]
 *         description: Filtrar por status da assinatura
 *       - in: query
 *         name: plan_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID do plano
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
 *         description: Lista de assinaturas
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
 *                     $ref: '#/components/schemas/Subscription'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
subscriptionRoutes.get('/', app.requireDatabaseConnection, subscriptionController.listSubscriptions);

/**
 * @swagger
 * /api/subscriptions/{id}/cancel:
 *   post:
 *     summary: Cancela uma assinatura ativa
 *     tags: [Assinaturas]
 *     description: Cancela uma assinatura que está ativa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da assinatura
 *     responses:
 *       200:
 *         description: Assinatura cancelada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
subscriptionRoutes.post('/:id/cancel', app.requireDatabaseConnection, subscriptionController.cancelSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}/pause:
 *   post:
 *     summary: Pausa uma assinatura ativa
 *     tags: [Assinaturas]
 *     description: Pausa temporariamente uma assinatura ativa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da assinatura
 *     responses:
 *       200:
 *         description: Assinatura pausada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
subscriptionRoutes.post('/:id/pause', app.requireDatabaseConnection, subscriptionController.pauseSubscription);

/**
 * @swagger
 * /api/subscriptions/{id}/reactivate:
 *   post:
 *     summary: Reativa uma assinatura pausada
 *     tags: [Assinaturas]
 *     description: Reativa uma assinatura que estava pausada
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da assinatura
 *     responses:
 *       200:
 *         description: Assinatura reativada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Subscription'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
subscriptionRoutes.post('/:id/reactivate', app.requireDatabaseConnection, subscriptionController.reactivateSubscription);

/**
 * @swagger
 * /api/subscriptions/webhook:
 *   post:
 *     summary: Webhook para notificações de assinaturas do Mercado Pago
 *     tags: [Assinaturas]
 *     description: Endpoint para receber notificações de assinaturas do Mercado Pago
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
subscriptionRoutes.post('/webhook', subscriptionController.handleWebhook);

export default subscriptionRoutes;