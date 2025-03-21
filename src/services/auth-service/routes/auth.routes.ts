/**
 * Rotas de autenticação
 */

import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthController } from "../controllers/auth.controller";
import authMiddleware from "@shared/middleware/auth.middleware";
import app from "@/app";

const authRoutes = Router();
const prisma = app.prisma;
const authController = new AuthController(prisma);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autentica um usuário ou empresa
 *     tags: [Autenticação]
 *     description: Autentica um usuário ou empresa e retorna um token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@exemplo.com
 *               password:
 *                 type: string
 *                 example: Senha123
 *               isCompany:
 *                 type: boolean
 *                 example: false
 *                 description: Indica se é login de empresa
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
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
 *                     user:
 *                       type: object
 *                     token:
 *                       type: string
 *                     expiresIn:
 *                       type: integer
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 *       500:
 *         description: Erro interno do servidor
 */
authRoutes.post("/login", app.requireDatabaseConnection, authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra um novo usuário (aluno)
 *     tags: [Autenticação]
 *     description: Cria uma nova conta de aluno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               cpf:
 *                 type: string
 *               phone_user:
 *                 type: string
 *               gender_id:
 *                 type: integer
 *               education_id:
 *                 type: integer
 *               address:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   cep:
 *                     type: string
 *                   number:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
authRoutes.post(
  "/register",
  app.requireDatabaseConnection,
  authController.registerUser
);

/**
 * @swagger
 * /api/auth/register-company:
 *   post:
 *     summary: Registra uma nova empresa
 *     tags: [Autenticação]
 *     description: Cria uma nova conta de empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trade_name:
 *                 type: string
 *               business_name:
 *                 type: string
 *               cnpj:
 *                 type: string
 *               contact_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               whatsapp:
 *                 type: string
 *               mobile_phone:
 *                 type: string
 *               landline_phone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   cep:
 *                     type: string
 *                   number:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Empresa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
authRoutes.post(
  "/register-company",
  app.requireDatabaseConnection,
  authController.registerCompany
);

/**
 * @swagger
 * /api/auth/users:
 *   post:
 *     summary: Cria um novo usuário (admin, professor, recrutador, etc.)
 *     tags: [Autenticação]
 *     description: Cria um novo usuário com perfil específico (apenas para administradores)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               cpf:
 *                 type: string
 *               phone_user:
 *                 type: string
 *               gender_id:
 *                 type: integer
 *               education_id:
 *                 type: integer
 *               role_id:
 *                 type: integer
 *               status:
 *                 type: integer
 *               address:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   cep:
 *                     type: string
 *                   number:
 *                     type: integer
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
authRoutes.post(
  "/users",
  app.requireDatabaseConnection,
  authMiddleware.authenticate,
  authMiddleware.accessLevel(4), // Apenas administradores
  authController.createUser
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtém informações do usuário autenticado
 *     tags: [Autenticação]
 *     description: Retorna os dados do usuário autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
authRoutes.get(
  "/me",
  authMiddleware.authenticate,
  authController.getAuthenticatedUser
);

export default authRoutes;
