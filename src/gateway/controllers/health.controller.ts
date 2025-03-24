import { Request, Response } from "express";
import { getPrismaClient } from "@shared/config/database";
import { config } from "@shared/config/env";
import pkg from "../../../package.json";

/**
 * Controller para verificação de saúde da API
 */
export const healthController = {
  /**
   * Verifica o status da API e suas dependências
   * @route GET /api/health
   */
  check: async (req: Request, res: Response) => {
    // Status inicial
    const health = {
      status: "ok",
      timestamp: new Date(),
      environment: config.NODE_ENV,
      version: pkg.version,
      database: "not_checked",
      services: {
        auth: "available",
        payment: "available",
        notification: "available",
        cms: "available",
      },
    };

    try {
      // Verifica a conexão com o banco de dados
      if (!config.ALLOW_NO_DB_MODE) {
        const prisma = getPrismaClient();
        await prisma.$queryRaw`SELECT 1`;
        health.database = "connected";
      } else {
        health.database = "disabled";
      }
    } catch (error) {
      health.status = "warning";
      health.database = "disconnected";
    }

    // Retorna o status
    res.json(health);
  },
};
