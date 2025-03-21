/**
 * Utilitário para padronização de respostas da API
 * Fornece funções para gerar respostas em formato consistente
 */

import { Response } from "express";

/**
 * Interface para informações de paginação
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Classe que fornece métodos estáticos para padronização de respostas da API
 */
export class ApiResponse {
  /**
   * Envia uma resposta de sucesso
   * @param res Objeto de resposta do Express
   * @param data Dados a serem incluídos na resposta
   * @param statusCode Código de status HTTP (padrão: 200)
   * @param message Mensagem opcional
   */
  public static success(
    res: Response,
    data: any = null,
    statusCode: number = 200,
    message: string = "Operação realizada com sucesso"
  ): Response {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  }

  /**
   * Envia uma resposta de erro
   * @param res Objeto de resposta do Express
   * @param message Mensagem de erro
   * @param statusCode Código de status HTTP (padrão: 400)
   * @param errors Detalhes dos erros (opcional)
   */
  public static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors: any = null
  ): Response {
    const response: any = {
      status: "error",
      message,
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Envia uma resposta paginada
   * @param res Objeto de resposta do Express
   * @param data Dados a serem incluídos na resposta
   * @param pagination Informações de paginação
   * @param statusCode Código de status HTTP (padrão: 200)
   * @param message Mensagem opcional
   */
  public static paginated(
    res: Response,
    data: any[],
    pagination: PaginationInfo,
    statusCode: number = 200,
    message: string = "Operação realizada com sucesso"
  ): Response {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
      },
    });
  }

  /**
   * Envia uma resposta de criação bem-sucedida
   * @param res Objeto de resposta do Express
   * @param data Dados a serem incluídos na resposta
   * @param message Mensagem opcional
   */
  public static created(
    res: Response,
    data: any,
    message: string = "Recurso criado com sucesso"
  ): Response {
    return this.success(res, data, 201, message);
  }

  /**
   * Envia uma resposta para requisição sem conteúdo
   * @param res Objeto de resposta do Express
   */
  public static noContent(res: Response): Response {
    return res.status(204).end();
  }
}

export default ApiResponse;
