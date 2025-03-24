import { Request, Response } from "express";
import { emailService } from "../services/email.service";
import { logger } from "@shared/utils/logger";

/**
 * Controlador para testes de email
 */
export const emailController = {
  /**
   * Envia um email de teste
   * @route POST /api/v1/email/test
   */
  sendTestEmail: async (req: Request, res: Response) => {
    const { to } = req.body;

    // Validar entrada
    if (!to || typeof to !== "string" || !to.includes("@")) {
      return res.status(400).json({
        status: "error",
        message: "Endereço de email inválido",
      });
    }

    try {
      // Enviar email de teste
      const result = await emailService.sendTestEmail(to);

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
          error:
            result.error instanceof Error
              ? result.error.message
              : String(result.error),
        });
      }
    } catch (error) {
      logger.error("Erro ao processar envio de email de teste:", error);
      return res.status(500).json({
        status: "error",
        message: "Erro ao processar envio de email de teste",
      });
    }
  },

  /**
   * Envia um email personalizado
   * @route POST /api/v1/email/send
   */
  sendCustomEmail: async (req: Request, res: Response) => {
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

    try {
      // Enviar email personalizado
      const result = await emailService.sendEmail({
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
          error:
            result.error instanceof Error
              ? result.error.message
              : String(result.error),
        });
      }
    } catch (error) {
      logger.error("Erro ao processar envio de email:", error);
      return res.status(500).json({
        status: "error",
        message: "Erro ao processar envio de email",
      });
    }
  },
};
