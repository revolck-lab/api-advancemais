import { Router, Request, Response } from "express";
import { emailController } from "../controllers/email.controller";

// Criar instância do router
const router = Router();

/**
 * @swagger
 * /email/test:
 *   post:
 *     summary: Envia um email de teste
 *     tags: ['Email']
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email de teste enviado com sucesso
 *       400:
 *         description: Dados de entrada inválidos
 *       500:
 *         description: Erro ao enviar o email
 */
router.post("/test", function (req: Request, res: Response) {
  emailController.sendTestEmail(req, res);
});

/**
 * @swagger
 * /email/send:
 *   post:
 *     summary: Envia um email personalizado
 *     tags: ['Email']
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - htmlContent
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *               subject:
 *                 type: string
 *               htmlContent:
 *                 type: string
 *               textContent:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email enviado com sucesso
 *       400:
 *         description: Dados de entrada inválidos
 *       500:
 *         description: Erro ao enviar o email
 */
router.post("/send", function (req: Request, res: Response) {
  emailController.sendCustomEmail(req, res);
});

// Exportar o router
export { router as emailRoutes };
