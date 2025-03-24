import { Router } from "express";
import { healthController } from "../controllers";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar o status da API
 *     description: Retorna o status atual da API e suas dependências
 *     tags: ['Health']
 *     responses:
 *       200:
 *         description: Status da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 database:
 *                   type: string
 *                   example: connected
 *                 services:
 *                   type: object
 */
router.get("/", healthController.check);

export { router as healthRoutes };
