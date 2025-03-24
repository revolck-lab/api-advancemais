import { config } from "@shared/config/env";

// Níveis de log disponíveis
type LogLevel = "error" | "warn" | "info" | "debug";

// Mapeamento de cores para console
const colors = {
  error: "\x1b[31m", // Vermelho
  warn: "\x1b[33m", // Amarelo
  info: "\x1b[36m", // Ciano
  debug: "\x1b[90m", // Cinza
  reset: "\x1b[0m", // Reset
};

/**
 * Classe para gerenciamento de logs da aplicação
 */
class Logger {
  private level: LogLevel;

  constructor() {
    this.level = (config.LOG_LEVEL as LogLevel) || "info";
  }

  /**
   * Verifica se o nível de log está habilitado
   */
  private isLevelEnabled(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };

    return levels[level] <= levels[this.level];
  }

  /**
   * Formata a mensagem de log com timestamp
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    return `${timestamp} [${levelStr}] ${message}`;
  }

  /**
   * Método genérico para registrar logs
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.isLevelEnabled(level)) return;

    const color = colors[level];
    const reset = colors.reset;

    const formattedMsg = this.formatMessage(level, message);

    // Em produção não usamos cores
    if (config.NODE_ENV === "production") {
      console[level === "debug" ? "log" : level](formattedMsg, ...args);
    } else {
      console[level === "debug" ? "log" : level](
        `${color}${formattedMsg}${reset}`,
        ...args
      );
    }
  }

  /**
   * Log de nível debug
   */
  debug(message: string, ...args: any[]): void {
    this.log("debug", message, ...args);
  }

  /**
   * Log de nível info
   */
  info(message: string, ...args: any[]): void {
    this.log("info", message, ...args);
  }

  /**
   * Log de nível warn
   */
  warn(message: string, ...args: any[]): void {
    this.log("warn", message, ...args);
  }

  /**
   * Log de nível error
   */
  error(message: string, ...args: any[]): void {
    this.log("error", message, ...args);
  }
}

// Exportamos uma instância única do logger
export const logger = new Logger();
