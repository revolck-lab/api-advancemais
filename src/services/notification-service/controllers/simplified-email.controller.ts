import { Request, Response } from "express";
import { simplifiedEmailService } from "../services/simplified-email.service";
import { logger } from "@shared/utils/logger";

/**
 * Controller simplificado para o serviço de email
 */
export const simplifiedEmailController = {
  /**
   * Envia um email de teste
   * @route POST /api/v1/email/test
   */
  sendTestEmail: async (req: Request, res: Response) => {
    try {
      const { to } = req.body;

      // Validar entrada
      if (!to || typeof to !== "string" || !to.includes("@")) {
        return res.status(400).json({
          status: "error",
          message: "Endereço de email inválido",
        });
      }

      // Enviar email de teste
      const result = await simplifiedEmailService.sendTestEmail(to);

      if (result.success) {
        return res.status(200).json({
          status: "success",
          message: "Email de teste enviado com sucesso",
          messageId: result.messageId,
        });
      } else {
        logger.error("Falha ao enviar email de teste:", result.error);
        return res.status(500).json({
          status: "error",
          message: "Falha ao enviar email de teste",
          error: result.error,
        });
      }
    } catch (error) {
      logger.error("Erro ao processar envio de email de teste:", error);
      return res.status(500).json({
        status: "error",
        message: "Erro interno ao processar envio de email de teste",
      });
    }
  },

  /**
   * Envia um email personalizado
   * @route POST /api/v1/email/send
   */
  sendCustomEmail: async (req: Request, res: Response) => {
    try {
      const { to, subject, htmlContent, textContent } = req.body;

      // Validar entrada
      if (!to || typeof to !== "string" || !to.includes("@")) {
        return res.status(400).json({
          status: "error",
          message: "Endereço de email inválido",
        });
      }

      if (!subject || typeof subject !== "string") {
        return res.status(400).json({
          status: "error",
          message: "Assunto inválido",
        });
      }

      if (!htmlContent || typeof htmlContent !== "string") {
        return res.status(400).json({
          status: "error",
          message: "Conteúdo HTML inválido",
        });
      }

      // Enviar email personalizado
      const result = await simplifiedEmailService.sendEmail({
        to: [{ email: to }],
        content: {
          subject,
          htmlContent,
          textContent,
        },
      });

      if (result.success) {
        return res.status(200).json({
          status: "success",
          message: "Email enviado com sucesso",
          messageId: result.messageId,
        });
      } else {
        logger.error("Falha ao enviar email:", result.error);
        return res.status(500).json({
          status: "error",
          message: "Falha ao enviar email",
          error: result.error,
        });
      }
    } catch (error) {
      logger.error("Erro ao processar envio de email:", error);
      return res.status(500).json({
        status: "error",
        message: "Erro interno ao processar envio de email",
      });
    }
  },

  /**
   * Verifica o status do serviço de email
   * @route GET /api/v1/email/status
   */
  checkStatus: async (req: Request, res: Response) => {
    try {
      const isInitialized = simplifiedEmailService.isInitialized();

      return res.status(200).json({
        status: "success",
        emailService: {
          initialized: isInitialized,
          status: isInitialized ? "online" : "offline",
        },
      });
    } catch (error) {
      logger.error("Erro ao verificar status do serviço de email:", error);
      return res.status(500).json({
        status: "error",
        message: "Erro ao verificar status do serviço de email",
      });
    }
  },

  /**
   * Força a reinicialização do serviço de email
   * @route POST /api/v1/email/reinitialize
   */
  reinitializeService: async (req: Request, res: Response) => {
    try {
      const success = simplifiedEmailService.reinitialize();

      return res.status(200).json({
        status: success ? "success" : "error",
        message: success
          ? "Serviço de email reinicializado com sucesso"
          : "Falha ao reinicializar o serviço de email",
        emailService: {
          initialized: success,
          status: success ? "online" : "offline",
        },
      });
    } catch (error) {
      logger.error("Erro ao reinicializar serviço de email:", error);
      return res.status(500).json({
        status: "error",
        message: "Erro interno ao reinicializar o serviço de email",
      });
    }
  },
};
