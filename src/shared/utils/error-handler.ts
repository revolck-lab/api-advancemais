import { logger } from "./logger";

/**
 * Interface para as opções de captura de erro
 */
interface ErrorCaptureOptions<T> {
  silent?: boolean;
  defaultReturn?: T;
  context?: string;
  rethrow?: boolean;
}

/**
 * Utilitário para capturar e manipular erros de forma padronizada
 */
export class ErrorHandler {
  /**
   * Captura erros em funções assíncronas
   *
   * @param fn Função assíncrona a ser executada
   * @param options Opções de captura
   * @returns Resultado da função ou valor padrão em caso de erro
   */
  static async captureAsync<T>(
    fn: () => Promise<T>,
    options: ErrorCaptureOptions<T> = {}
  ): Promise<T> {
    const {
      silent = false,
      defaultReturn,
      context = "Operação assíncrona",
      rethrow = false,
    } = options;

    try {
      return await fn();
    } catch (error) {
      if (!silent) {
        logger.error(`${context} falhou:`, error);
      }

      if (rethrow) {
        throw error;
      }

      // Garantir que defaultReturn não seja undefined
      if (defaultReturn === undefined) {
        throw new Error(
          `ErrorHandler.captureAsync: defaultReturn deve ser fornecido para o contexto "${context}"`
        );
      }

      return defaultReturn as T;
    }
  }

  /**
   * Captura erros em funções síncronas
   *
   * @param fn Função síncrona a ser executada
   * @param options Opções de captura
   * @returns Resultado da função ou valor padrão em caso de erro
   */
  static capture<T>(fn: () => T, options: ErrorCaptureOptions<T> = {}): T {
    const {
      silent = false,
      defaultReturn,
      context = "Operação",
      rethrow = false,
    } = options;

    try {
      return fn();
    } catch (error) {
      if (!silent) {
        logger.error(`${context} falhou:`, error);
      }

      if (rethrow) {
        throw error;
      }

      // Garantir que defaultReturn não seja undefined
      if (defaultReturn === undefined) {
        throw new Error(
          `ErrorHandler.capture: defaultReturn deve ser fornecido para o contexto "${context}"`
        );
      }

      return defaultReturn as T;
    }
  }

  /**
   * Verifica se um erro é uma instância de Error ou um outro tipo
   *
   * @param error Erro a ser verificado
   * @returns Mensagem de erro formatada
   */
  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    return JSON.stringify(error);
  }

  /**
   * Registra informações detalhadas sobre um erro
   *
   * @param error Erro a ser registrado
   * @param context Contexto do erro
   */
  static logDetailedError(error: unknown, context: string = "Erro"): void {
    const errorMessage = this.getErrorMessage(error);
    logger.error(`${context}: ${errorMessage}`);

    if (error instanceof Error && error.stack) {
      logger.error(`Stack: ${error.stack}`);
    }
  }
}
