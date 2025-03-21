import { Request, Response } from "express";
import { AppError, ValidationError } from "@shared/errors/app-error";
import { ApiResponse } from "../interfaces/shared.interface";
import { ErrorLogger } from "@shared/utils/error-logger";

export abstract class BaseController {
  protected logger = ErrorLogger.getInstance();

  /**
   * Método para resposta de sucesso padronizada
   * @param res Objeto de resposta do Express
   * @param data Dados a serem incluídos na resposta
   * @param message Mensagem de sucesso (opcional)
   * @param statusCode Código de status HTTP (padrão: 200)
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message: string = "Operação realizada com sucesso",
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      status: "success",
      message,
      data,
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Método para resposta de erro padronizada
   * @param res Objeto de resposta do Express
   * @param error Erro a ser tratado
   * @param context Contexto do erro para logging
   */
  protected handleError(res: Response, error: any, context: string): Response {
    this.logger.logError(error, context);

    if (error instanceof ValidationError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
        details: error.details,
      });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    // Erro não tratado
    return res.status(500).json({
      status: "error",
      message: "Erro interno do servidor",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }

  /**
   * Executa uma função de controlador com tratamento de erros padronizado
   * @param req Objeto de requisição do Express
   * @param res Objeto de resposta do Express
   * @param fn Função a ser executada
   * @param context Contexto para logging de erros
   */
  protected async executeHandler(
    req: Request,
    res: Response,
    fn: (req: Request, res: Response) => Promise<void>,
    context: string
  ): Promise<void> {
    try {
      await fn.call(this, req, res);
    } catch (error) {
      this.handleError(res, error, context);
    }
  }

  /**
   * Extrai e valida um ID numérico da requisição
   * @param req Objeto de requisição do Express
   * @param paramName Nome do parâmetro contendo o ID
   * @param res Objeto de resposta do Express (opcional)
   * @returns ID numérico ou null se inválido e res for fornecido
   * @throws AppError se o ID for inválido e res não for fornecido
   */
  protected extractId(
    req: Request,
    paramName: string = "id",
    res?: Response
  ): number | null {
    const id = parseInt(req.params[paramName], 10);

    if (isNaN(id)) {
      if (res) {
        res.status(400).json({
          status: "error",
          message: `ID inválido: ${req.params[paramName]}`,
        });
        return null;
      }
      throw new AppError(`ID inválido: ${req.params[paramName]}`, 400);
    }

    return id;
  }

  /**
   * Método para validar parâmetros de paginação
   * @param query Objeto de query da requisição
   * @returns Objeto com page e limit normalizados
   */
  protected getPaginationParams(query: any): { page: number; limit: number } {
    const page = parseInt(query.page as string, 10) || 1;
    let limit = parseInt(query.limit as string, 10) || 10;

    // Limitar o tamanho máximo da página
    limit = Math.min(limit, 100);

    return {
      page: page < 1 ? 1 : page,
      limit: limit < 1 ? 10 : limit,
    };
  }
}
