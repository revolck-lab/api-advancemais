import { AppError } from "../errors/app-error";

// Tipos de log suportados
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}

// Interface para um serviço de log externo (para futuras implementações)
export interface LoggerService {
  log(level: LogLevel, message: string, meta?: Record<string, any>): void;
}

/**
 * Classe para gerenciamento centralizado de logs de erro
 * Fornece uma API consistente para registrar erros e informações importantes
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private externalServices: LoggerService[] = [];
  private environment: string;
  private appVersion: string;
  private logLevel: LogLevel = LogLevel.INFO;

  /**
   * Construtor privado para implementação do padrão Singleton
   */
  private constructor() {
    this.environment = process.env.NODE_ENV || "development";
    this.appVersion = process.env.npm_package_version || "1.0.0";

    // Definir o nível de log com base no ambiente
    if (process.env.LOG_LEVEL) {
      this.logLevel = process.env.LOG_LEVEL as LogLevel;
    } else {
      this.logLevel =
        this.environment === "production" ? LogLevel.ERROR : LogLevel.DEBUG;
    }
  }

  /**
   * Retorna a instância única do logger de erros
   */
  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Registra um erro com contexto completo
   * @param error Erro a ser registrado
   * @param context Informações adicionais sobre o contexto do erro
   * @param request Objeto de requisição (opcional)
   */
  public logError(
    error: Error | AppError,
    context: string,
    request?: any
  ): void {
    const timestamp = new Date().toISOString();
    const isAppError = error instanceof AppError;

    // Construir metadados do erro
    const errorMeta: Record<string, any> = {
      timestamp,
      environment: this.environment,
      appVersion: this.appVersion,
      context,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack,
    };

    // Adicionar detalhes específicos para AppError
    if (isAppError) {
      const appError = error as AppError;
      errorMeta.statusCode = appError.statusCode;
      errorMeta.details = appError.details;
      errorMeta.isAppError = true;
    }

    // Adicionar informações da requisição se disponíveis
    if (request) {
      errorMeta.request = {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        ip: request.ip,
        userAgent: request.get ? request.get("User-Agent") : undefined,
        userId: request.user ? request.user.id : undefined,
      };
    }

    // Log no console
    const logMessage = `[ERROR] [${context}] ${error.message}`;
    console.error(logMessage);

    // Em ambiente de desenvolvimento, exibir o stack trace
    if (this.environment === "development" && error.stack) {
      console.error(error.stack);
    }

    // Enviar para serviços externos se configurados
    this.externalServices.forEach((service) => {
      service.log(LogLevel.ERROR, logMessage, errorMeta);
    });
  }

  /**
   * Registra uma mensagem informativa
   * @param message Mensagem a ser registrada
   * @param context Contexto da mensagem
   * @param meta Metadados adicionais
   */
  public logInfo(
    message: string,
    context: string,
    meta?: Record<string, any>
  ): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[INFO] [${context}] ${message}`;

    console.log(logMessage);

    const infoMeta = {
      timestamp,
      environment: this.environment,
      appVersion: this.appVersion,
      context,
      ...meta,
    };

    this.externalServices.forEach((service) => {
      service.log(LogLevel.INFO, logMessage, infoMeta);
    });
  }

  /**
   * Registra um aviso
   * @param message Mensagem de aviso
   * @param context Contexto do aviso
   * @param meta Metadados adicionais
   */
  public logWarning(
    message: string,
    context: string,
    meta?: Record<string, any>
  ): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[WARN] [${context}] ${message}`;

    console.warn(logMessage);

    const warnMeta = {
      timestamp,
      environment: this.environment,
      appVersion: this.appVersion,
      context,
      ...meta,
    };

    this.externalServices.forEach((service) => {
      service.log(LogLevel.WARN, logMessage, warnMeta);
    });
  }

  /**
   * Registra uma mensagem de debug
   * @param message Mensagem de debug
   * @param context Contexto do debug
   * @param meta Metadados adicionais
   */
  public logDebug(
    message: string,
    context: string,
    meta?: Record<string, any>
  ): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[DEBUG] [${context}] ${message}`;

    console.debug(logMessage);

    const debugMeta = {
      timestamp,
      environment: this.environment,
      appVersion: this.appVersion,
      context,
      ...meta,
    };

    this.externalServices.forEach((service) => {
      service.log(LogLevel.DEBUG, logMessage, debugMeta);
    });
  }

  /**
   * Registra um erro fatal do sistema
   * @param error Erro fatal
   * @param context Contexto do erro
   * @param meta Metadados adicionais
   */
  public logFatal(
    error: Error,
    context: string,
    meta?: Record<string, any>
  ): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[FATAL] [${context}] ${error.message}`;

    console.error(logMessage);
    console.error(error.stack);

    const fatalMeta = {
      timestamp,
      environment: this.environment,
      appVersion: this.appVersion,
      context,
      stack: error.stack,
      ...meta,
    };

    this.externalServices.forEach((service) => {
      service.log(LogLevel.FATAL, logMessage, fatalMeta);
    });
  }

  /**
   * Adiciona um serviço de log externo
   * @param service Serviço de log a ser adicionado
   */
  public addExternalLogService(service: LoggerService): void {
    this.externalServices.push(service);
  }

  /**
   * Verifica se o nível de log deve ser registrado
   * @param level Nível de log a ser verificado
   * @returns true se o log deve ser registrado
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.FATAL,
    ];
    const currentIndex = levels.indexOf(this.logLevel);
    const targetIndex = levels.indexOf(level);

    return targetIndex >= currentIndex;
  }
}
