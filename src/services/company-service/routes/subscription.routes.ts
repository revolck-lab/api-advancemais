// src/services/company-service/routes/subscription.routes.ts

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { SubscriptionController } from "../controllers/subscription.controller";
import authMiddleware from "@shared/middleware/auth.middleware";
import app from "@/app";

/**
 * Rotas para operações de assinaturas de empresas
 */
const subscriptionRoutes = Router();
const prisma = app.prisma;
const subscriptionController = new SubscriptionController(prisma);

/**
 * @swagger
 * /api/companies/subscriptions:
 *   post:
 *     summary: Cria uma nova assinatura
 *     tags: [Assinaturas]
 *     description: Cria uma nova assinatura para uma empresa
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_id:
 *                 type: integer
 *                 example: 1
 *               plan_id:
 *                 type: string
 *                 example: 12345678-1234-1234-1234-123456789012
 *               payment_method_id:
 *                 type: string
 *                 example: credit_card
 *               auto_recurring:
 *                 type: boolean
 *                 example: true
 *               is_exempted:
 *                 type: boolean
 *                 example: false
 *               exemption_reason:
 *                 type: string
 *                 example: Parceria institucional
 *               exempted_by:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Assinatura criada com sucesso
 *       400:
 *         description: Dados inválidos fornecidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 *       404:
 *         description: Empresa ou plano não encontrado
 *       409:
 *         description: A empresa já possui assinatura ativa
 */
subscriptionRoutes.post(
  "/",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  authMiddleware.accessLevel(4), // Apenas administradores
  subscriptionController.createSubscription
);

/**
 * @swagger
 * /api/companies/subscriptions:
 *   get:
 *     summary: Lista assinaturas
 *     tags: [Assinaturas]
 *     description: Retorna uma lista paginada de assinaturas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Quantidade por página
 *       - in: query
 *         name: company_id
 *         schema:
 *           type: integer
 *         description: Filtrar por ID da empresa
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
 *       - in: query
 *         name: plan_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID do plano
 *       - in: query
 *         name: is_exempted
 *         schema:
 *           type: boolean
 *         description: Filtrar por isenção
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final
 *     responses:
 *       200:
 *         description: Lista de assinaturas retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */
subscriptionRoutes.get(
  "/",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  authMiddleware.accessLevel(4), // Apenas administradores
  subscriptionController.listSubscriptions
);

/**
 * @swagger
 * /api/companies/subscriptions/{id}:
 *   get:
 *     summary: Obtém detalhes de uma assinatura
 *     tags: [Assinaturas]
 *     description: Retorna os detalhes de uma assinatura específica
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
 *         description: Detalhes da assinatura retornados com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 *       404:
 *         description: Assinatura não encontrada
 */
subscriptionRoutes.get(
  "/:id",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  subscriptionController.getSubscriptionById
);

/**
 * @swagger
 * /api/companies/subscriptions/company/{companyId}:
 *   get:
 *     summary: Obtém a assinatura ativa de uma empresa
 *     tags: [Assinaturas]
 *     description: Retorna a assinatura ativa de uma empresa específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Assinatura ativa retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 *       404:
 *         description: Empresa não encontrada ou não possui assinatura ativa
 */
subscriptionRoutes.get(
  "/company/:companyId",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  subscriptionController.getActiveSubscription
);

/**
 * @swagger
 * /api/companies/subscriptions/{id}:
 *   put:
 *     summary: Atualiza uma assinatura
 *     tags: [Assinaturas]
 *     description: Atualiza os dados de uma assinatura específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da assinatura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: active
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               next_payment_date:
 *                 type: string
 *                 format: date-time
 *               is_exempted:
 *                 type: boolean
 *               exemption_reason:
 *                 type: string
 *               exempted_by:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Assinatura atualizada com sucesso
 *       400:
 *         description: Dados inválidos fornecidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 *       404:
 *         description: Assinatura não encontrada
 */
subscriptionRoutes.put(
  "/:id",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  authMiddleware.accessLevel(4), // Apenas administradores
  subscriptionController.updateSubscription
);

/**
 * @swagger
 * /api/companies/subscriptions/{id}/cancel:
 *   post:
 *     summary: Cancela uma assinatura
 *     tags: [Assinaturas]
 *     description: Cancela uma assinatura específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da assinatura
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellation_reason:
 *                 type: string
 *                 example: Solicitação do cliente
 *               canceled_by:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Assinatura cancelada com sucesso
 *       400:
 *         description: Dados inválidos fornecidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 *       404:
 *         description: Assinatura não encontrada
 *       409:
 *         description: Assinatura já está cancelada
 */
subscriptionRoutes.post(
  "/:id/cancel",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  authMiddleware.accessLevel(4), // Apenas administradores
  subscriptionController.cancelSubscription
);

/**
 * @swagger
 * /api/companies/subscriptions/plans:
 *   get:
 *     summary: Lista todos os planos disponíveis
 *     tags: [Assinaturas]
 *     description: Retorna uma lista de todos os planos de assinatura disponíveis
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir planos inativos
 *     responses:
 *       200:
 *         description: Lista de planos retornada com sucesso
 *       401:
 *         description: Não autorizado
 */
subscriptionRoutes.get(
  "/plans",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  subscriptionController.listPlans
);

/**
 * @swagger
 * /api/companies/subscriptions/plans/{id}:
 *   get:
 *     summary: Obtém detalhes de um plano
 *     tags: [Assinaturas]
 *     description: Retorna os detalhes de um plano específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do plano
 *     responses:
 *       200:
 *         description: Detalhes do plano retornados com sucesso
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Plano não encontrado
 */
subscriptionRoutes.get(
  "/plans/:id",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  subscriptionController.getPlanById
);

export default subscriptionRoutes;
