import { PrismaClient } from "@prisma/client";
import { ErrorLogger } from "@shared/utils/error-logger";
import { NotFoundError } from "@shared/errors/app-error";

export abstract class BaseRepository {
  protected readonly logger = ErrorLogger.getInstance();

  /**
   * Inicializa o repositório base
   * @param prisma Instância do cliente Prisma
   * @param context Nome do contexto para logging (geralmente o nome da classe)
   */
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly context: string
  ) {}

  /**
   * Executa uma operação de banco de dados com tratamento de erro padronizado
   * @param operation Operação a ser executada
   * @param errorContext Informações de contexto adicionais para logging
   * @returns Resultado da operação
   */
  protected async executeOperation<T>(
    operation: () => Promise<T>,
    errorContext: Record<string, any> = {}
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Se for um NotFoundError, não é necessário logar, apenas propagar
      if (error instanceof NotFoundError) {
        throw error;
      }

      // Sanitiza dados sensíveis antes de logar
      const sanitizedContext = this.sanitizeContext(errorContext);

      // Loga o erro com contexto
      this.logger.logError(error as Error, `${this.context}`, sanitizedContext);

      // Propaga o erro
      throw error;
    }
  }

  /**
   * Remove dados sensíveis antes de logar
   * @param context Objeto de contexto original
   * @returns Objeto de contexto sanitizado
   */
  private sanitizeContext(context: Record<string, any>): Record<string, any> {
    const sanitized = { ...context };

    // Lista de chaves que podem conter dados sensíveis
    const sensitiveKeys = ["password", "token", "secret", "creditCard", "card"];

    // Recursivamente sanitiza o objeto
    const sanitizeObj = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj;

      if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObj(item));
      }

      const result: Record<string, any> = {};

      for (const [key, value] of Object.entries(obj)) {
        // Se for uma chave sensível, substitui o valor
        if (
          sensitiveKeys.some((k) => key.toLowerCase().includes(k.toLowerCase()))
        ) {
          result[key] = "[REDACTED]";
        }
        // Se for um objeto, processa recursivamente
        else if (value && typeof value === "object") {
          result[key] = sanitizeObj(value);
        }
        // Caso contrário, mantém o valor original
        else {
          result[key] = value;
        }
      }

      return result;
    };

    return sanitizeObj(sanitized);
  }

  /**
   * Verifica se um registro existe pelo ID
   * @param model Nome da tabela/modelo no Prisma
   * @param id ID do registro
   * @param idField Nome do campo ID (padrão: 'id')
   * @returns true se o registro existir
   * @throws NotFoundError se o registro não existir
   */
  protected async checkExists(
    model: string,
    id: string | number,
    idField: string = "id"
  ): Promise<boolean> {
    const where = { [idField]: id };

    // @ts-ignore - Acesso dinâmico aos modelos do Prisma
    const record = await this.prisma[model].findUnique({
      where,
      select: { [idField]: true },
    });

    if (!record) {
      throw new NotFoundError(`${model} com ${idField} ${id} não encontrado`);
    }

    return true;
  }
}
