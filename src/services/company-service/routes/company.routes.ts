import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { CompanyController } from "../controllers/company.controller";
import app from "@/app";

/**
 * Rotas para operações de empresas
 */
const companyRoutes = Router();
const prisma = app.prisma;
const companyController = new CompanyController(prisma);

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
 *             type: object
 *             properties:
 *               trade_name:
 *                 type: string
 *                 example: Advogados Associados LTDA
 *               business_name:
 *                 type: string
 *                 example: Sociedade de Advogados LTDA
 *               cnpj:
 *                 type: string
 *                 example: 12345678901234
 *               contact_name:
 *                 type: string
 *                 example: João da Silva
 *               email:
 *                 type: string
 *                 example: contato@advogados.com
 *               password:
 *                 type: string
 *                 example: Senha@123
 *               whatsapp:
 *                 type: string
 *                 example: 11999999999
 *               mobile_phone:
 *                 type: string
 *                 example: 11999999999
 *               landline_phone:
 *                 type: string
 *                 example: 1122223333
 *               address:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                     example: Av. Paulista
 *                   number:
 *                     type: integer
 *                     example: 1000
 *                   city:
 *                     type: string
 *                     example: São Paulo
 *                   state:
 *                     type: string
 *                     example: SP
 *                   cep:
 *                     type: string
 *                     example: 01310100
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
 *             type: object
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
 *                 example: 1
 *                 description: 1=ativo, 0=inativo
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
  companyController.updateCompanyStatus
);

export default companyRoutes;
