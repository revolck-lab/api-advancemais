// src/modules/users/routes/index.js
const express = require("express");
const userController = require("../controllers/userController");
const userValidation = require("../../validators/userValidation");
const validate = require("../../middleware/validate");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API para gerenciar usuários
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Cadastro de usuário
 *     description: Registra um novo usuário no sistema
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro de validação
 */
router.post("/register", validate(userValidation), userController.register);

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login de usuário
 *     description: Realiza login de um usuário com login(CPF ou CNPJ) e senha
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Dados de login inválidos
 */
router.post("/login", userController.login);

module.exports = router;
