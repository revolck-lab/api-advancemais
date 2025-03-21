import { format } from "util";

/**
 * Níveis de log disponíveis
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

/**
 * Classe para gerenciar logs da aplicação
 */
export class Logger {
  private static instance: Logger;
  private currentLevel: LogLevel;

  /**
   * Construtor privado para implementação do padrão Singleton
   */
  private constructor() {
    // Determinar nível de log baseado na variável de ambiente
    const envLevel = (process.env.LOG_LEVEL || "info").toLowerCase();
    this.currentLevel = this.getLogLevelFromString(envLevel);
  }

  /**
   * Retorna a instância única do logger
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Converte string de nível de log para enum
   */
  private getLogLevelFromString(level: string): LogLevel {
    switch (level) {
      case "error":
        return LogLevel.ERROR;
      case "warn":
        return LogLevel.WARN;
      case "info":
        return LogLevel.INFO;
      case "debug":
        return LogLevel.DEBUG;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Formata a mensagem de log com timestamp
   */
  private formatMessage(
    level: LogLevel,
    message: string,
    ...args: any[]
  ): string {
    const timestamp = new Date().toISOString();
    const formattedMessage =
      args.length > 0 ? format(message, ...args) : message;
    const levelName = LogLevel[level].padEnd(5);

    return `${timestamp} [${levelName}] ${formattedMessage}`;
  }

  /**
   * Registra um log se o nível atual permitir
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level <= this.currentLevel) {
      const formattedMessage = this.formatMessage(level, message, ...args);

      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.INFO:
          console.log(formattedMessage);
          break;
        case LogLevel.DEBUG:
          console.debug(formattedMessage);
          break;
      }
    }
  }

  /**
   * Registra um log de erro
   */
  public error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * Registra um log de aviso
   */
  public warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Registra um log informativo
   */
  public info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Registra um log de depuração
   */
  public debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Registra um erro com stack trace
   */
  public logError(error: Error, context?: string): void {
    const contextPrefix = context ? `[${context}] ` : "";
    this.error(`${contextPrefix}${error.message}`);
    if (error.stack && this.currentLevel >= LogLevel.DEBUG) {
      this.debug(`Stack trace: ${error.stack}`);
    }
  }
}

export const logger = Logger.getInstance();
