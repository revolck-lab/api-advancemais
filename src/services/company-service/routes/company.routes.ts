import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";
import authMiddleware from "@shared/middleware/auth.middleware";
import app from "@/app";

/**
 * Configuração de rotas para operações de empresas
 * @module companyRoutes
 */
const companyRoutes = Router();

// Inicializa o controller com a instância do Prisma do app
const companyController = new CompanyController(app.prisma);

/**
 * @swagger
 * /api/companies:
 *   post:
 *     summary: Cria uma nova empresa
 *     tags: [Empresas]
 *     description: Cadastra uma nova empresa no sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCompanyDTO'
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 *       400:
 *         description: Dados inválidos fornecidos
 *       409:
 *         description: Empresa já existe com este CNPJ ou e-mail
 */
companyRoutes.post("/", companyController.createCompany);

/**
 * @swagger
 * /api/companies:
 *   get:
 *     summary: Lista empresas
 *     tags: [Empresas]
 *     description: Retorna uma lista paginada de empresas
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
 *         name: status
 *         schema:
 *           type: integer
 *         description: Status (1=ativo, 0=inativo)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome, CNPJ ou e-mail
 *     responses:
 *       200:
 *         description: Lista de empresas retornada com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 */
companyRoutes.get(
  "/",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  authMiddleware.accessLevel(4), // Apenas administradores
  companyController.getCompanies
);

/**
 * @swagger
 * /api/companies/{id}:
 *   get:
 *     summary: Obtém detalhes de uma empresa
 *     tags: [Empresas]
 *     description: Retorna os detalhes de uma empresa específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Detalhes da empresa retornados com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 *       404:
 *         description: Empresa não encontrada
 */
companyRoutes.get(
  "/:id",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  companyController.getCompanyById
);

/**
 * @swagger
 * /api/companies/{id}:
 *   put:
 *     summary: Atualiza dados de uma empresa
 *     tags: [Empresas]
 *     description: Atualiza os dados de uma empresa específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCompanyDTO'
 *     responses:
 *       200:
 *         description: Empresa atualizada com sucesso
 *       400:
 *         description: Dados inválidos fornecidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 *       404:
 *         description: Empresa não encontrada
 */
companyRoutes.put(
  "/:id",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  companyController.updateCompany
);

/**
 * @swagger
 * /api/companies/{id}/status:
 *   patch:
 *     summary: Atualiza o status de uma empresa
 *     tags: [Empresas]
 *     description: Ativa ou desativa uma empresa (1=ativo, 0=inativo)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [0, 1]
 *                 example: 1
 *                 description: 1=ativo, 0=inativo
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: Status da empresa atualizado com sucesso
 *       400:
 *         description: Dados inválidos fornecidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido
 *       404:
 *         description: Empresa não encontrada
 */
companyRoutes.patch(
  "/:id/status",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  authMiddleware.accessLevel(4), // Apenas administradores
  companyController.updateCompanyStatus
);

/**
 * @swagger
 * /api/companies/{id}/subscription/check:
 *   get:
 *     summary: Verifica se uma empresa possui assinatura ativa
 *     tags: [Empresas]
 *     description: Verifica se a empresa possui uma assinatura válida
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da empresa
 *     responses:
 *       200:
 *         description: Verificação realizada com sucesso
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
 *                     companyId:
 *                       type: integer
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: Empresa não encontrada
 */
companyRoutes.get(
  "/:id/subscription/check",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  companyController.checkSubscription
);

export default companyRoutes;
