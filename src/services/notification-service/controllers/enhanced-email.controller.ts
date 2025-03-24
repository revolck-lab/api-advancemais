import { Request, Response } from "express";
import { enhancedEmailService } from "../services/enhanced-email.service";
import { logger } from "@shared/utils/logger";
import { ErrorHandler } from "@shared/utils/error-handler";

/**
 * Controlador aprimorado para serviço de email
 */
export const enhancedEmailController = {
  /**
   * Envia um email de teste
   * @route POST /api/v1/email/test
   */
  sendTestEmail: async (req: Request, res: Response) => {
    return await ErrorHandler.captureAsync(
      async () => {
        const { to } = req.body;

        // Validar entrada
        if (!to || typeof to !== "string" || !to.includes("@")) {
          return res.status(400).json({
            status: "error",
            message: "Endereço de email inválido",
          });
        }

        // Enviar email de teste
        const result = await enhancedEmailService.sendTestEmail(to);

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
      },
      {
        context: "Envio de email de teste",
        defaultReturn: res.status(500).json({
          status: "error",
          message: "Erro interno ao processar envio de email de teste",
        }),
      }
    );
  },

  /**
   * Envia um email personalizado
   * @route POST /api/v1/email/send
   */
  sendCustomEmail: async (req: Request, res: Response) => {
    return await ErrorHandler.captureAsync(
      async () => {
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
        const result = await enhancedEmailService.sendEmail({
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
      },
      {
        context: "Envio de email personalizado",
        defaultReturn: res.status(500).json({
          status: "error",
          message: "Erro interno ao processar envio de email",
        }),
      }
    );
  },

  /**
   * Verifica o status do serviço de email
   * @route GET /api/v1/email/status
   */
  checkStatus: async (req: Request, res: Response) => {
    const isInitialized = enhancedEmailService.isInitialized();

    return res.status(200).json({
      status: "success",
      emailService: {
        initialized: isInitialized,
        status: isInitialized ? "online" : "offline",
      },
    });
  },

  /**
   * Força a reinicialização do serviço de email
   * @route POST /api/v1/email/reinitialize
   */
  reinitializeService: async (req: Request, res: Response) => {
    return await ErrorHandler.captureAsync(
      async () => {
        const success = await enhancedEmailService.reinitialize();

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
      },
      {
        context: "Reinicialização do serviço de email",
        defaultReturn: res.status(500).json({
          status: "error",
          message: "Erro interno ao reinicializar o serviço de email",
        }),
      }
    );
  },
};
