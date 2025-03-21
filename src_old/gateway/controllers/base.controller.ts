import { Request, Response } from "express";
import ApiResponse from "@/gateway/utils/response.util";
import { AppError } from "@/shared/errors/app-error";

/**
 * Classe base para controladores do gateway
 * Fornece métodos utilitários e funções de resposta padronizadas
 */
export abstract class BaseController {
  /**
   * Executa a lógica do controlador com tratamento de erros padronizado
   * @param req Objeto de requisição do Express
   * @param res Objeto de resposta do Express
   * @param callback Função a ser executada com tratamento de erros
   */
  protected async executeWithErrorHandling(
    req: Request,
    res: Response,
    callback: (req: Request, res: Response) => Promise<void>
  ): Promise<void> {
    try {
      await callback(req, res);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Manipula erros de forma padronizada
   * @param res Objeto de resposta do Express
   * @param error Erro capturado
   */
  protected handleError(res: Response, error: any): void {
    console.error(`[Controller Error] ${error.message || "Unknown error"}`);

    if (error instanceof AppError) {
      ApiResponse.error(res, error.message, error.statusCode, error.details);
    } else if (error.name === "ValidationError") {
      ApiResponse.error(
        res,
        "Erro de validação",
        400,
        error.details || error.message
      );
    } else if (error.name === "PrismaClientKnownRequestError") {
      ApiResponse.error(res, "Erro de banco de dados", 400);
    } else {
      ApiResponse.error(
        res,
        "Erro interno do servidor",
        500,
        process.env.NODE_ENV === "development" ? error.message : undefined
      );
    }
  }
}

export default BaseController;
