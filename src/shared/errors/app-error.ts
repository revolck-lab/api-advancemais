/**
 * Classe para padronização de erros da aplicação
 * Permite criar erros com códigos de status HTTP específicos
 */
export class AppError extends Error {
  /**
   * Código de status HTTP
   */
  public readonly statusCode: number;

  /**
   * Detalhes adicionais do erro (opcional)
   */
  public readonly details?: any;

  /**
   * Construtor para AppError
   * @param message Mensagem de erro
   * @param statusCode Código de status HTTP (default: 400)
   * @param details Detalhes adicionais (opcional)
   */
  constructor(message: string, statusCode = 400, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Classe para erros de validação
 * Especialização de AppError para erros de validação de dados
 */
export class ValidationError extends AppError {
  /**
   * Construtor para ValidationError
   * @param message Mensagem de erro
   * @param details Detalhes dos erros de validação (campos e suas mensagens)
   */
  constructor(message: string, details: Record<string, string[]>) {
    super(message, 400, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Classe para erros de não encontrado
 */
export class NotFoundError extends AppError {
  /**
   * Construtor para NotFoundError
   * @param message Mensagem de erro
   * @param details Detalhes adicionais (opcional)
   */
  constructor(message: string, details?: any) {
    super(message, 404, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Classe para erros de não autorizado
 */
export class UnauthorizedError extends AppError {
  /**
   * Construtor para UnauthorizedError
   * @param message Mensagem de erro
   * @param details Detalhes adicionais (opcional)
   */
  constructor(message: string, details?: any) {
    super(message, 401, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Classe para erros de acesso proibido
 */
export class ForbiddenError extends AppError {
  /**
   * Construtor para ForbiddenError
   * @param message Mensagem de erro
   * @param details Detalhes adicionais (opcional)
   */
  constructor(message: string, details?: any) {
    super(message, 403, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Classe para erros de conflito
 */
export class ConflictError extends AppError {
  /**
   * Construtor para ConflictError
   * @param message Mensagem de erro
   * @param details Detalhes adicionais (opcional)
   */
  constructor(message: string, details?: any) {
    super(message, 409, details);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
