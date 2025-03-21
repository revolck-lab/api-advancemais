// src/services/payment-service/repositories/payment.repository.ts

import { PrismaClient } from "@prisma/client";
import { ICache, defaultCache } from "@shared/utils/cache";
import {
  IPayment,
  IPaymentFilters,
  PaymentStatus,
  PaymentType,
} from "../interfaces/payment.interface";
import { NotFoundError } from "@shared/errors/app-error";
import { ErrorLogger } from "@shared/utils/error-logger";

const logger = ErrorLogger.getInstance();

/**
 * Repositório para operações relacionadas a pagamentos
 * Centraliza todo o acesso a dados relacionados a pagamentos
 */
export class PaymentRepository {
  /**
   * Construtor do repositório de pagamentos
   * @param prisma Instância do cliente Prisma
   * @param cache Instância do cache (opcional)
   */
  constructor(
    private readonly prisma: PrismaClient,
    private readonly cache: ICache = defaultCache
  ) {}

  /**
   * Prefixo para as chaves de cache
   */
  private readonly CACHE_PREFIX = "payment:";

  /**
   * Cria um novo registro de pagamento no banco de dados
   * @param data Dados do pagamento a ser criado
   * @returns Registro de pagamento criado
   */
  public async create(
    data: Omit<IPayment, "id" | "created_at" | "updated_at">
  ): Promise<IPayment> {
    try {
      // Preparar metadados para o banco
      const metadata = data.metadata ? JSON.stringify(data.metadata) : null;

      // Criar o pagamento
      const payment = await this.prisma.payment.create({
        data: {
          ...data,
          metadata,
        },
      });

      // Converter os dados de volta para o formato esperado
      return this.convertPaymentFromDatabase(payment);
    } catch (error) {
      logger.logError(error as Error, "PaymentRepository.create", { data });
      throw error;
    }
  }

  /**
   * Atualiza um registro de pagamento no banco de dados
   * @param id ID do pagamento
   * @param data Dados a serem atualizados
   * @returns Registro de pagamento atualizado
   */
  public async update(id: string, data: Partial<IPayment>): Promise<IPayment> {
    try {
      // Verificar se o pagamento existe
      const existingPayment = await this.findById(id);
      if (!existingPayment) {
        throw new NotFoundError(`Pagamento com ID ${id} não encontrado`);
      }

      // Preparar metadados para o banco
      const updateData: any = {
        ...data,
        updated_at: new Date(),
      };

      if (data.metadata) {
        updateData.metadata = JSON.stringify(data.metadata);
      }

      // Atualizar o pagamento
      const payment = await this.prisma.payment.update({
        where: { id },
        data: updateData,
      });

      // Invalidar cache
      await this.cache.delete(`${this.CACHE_PREFIX}${id}`);

      // Converter os dados de volta para o formato esperado
      return this.convertPaymentFromDatabase(payment);
    } catch (error) {
      logger.logError(error as Error, "PaymentRepository.update", { id, data });
      throw error;
    }
  }

  /**
   * Atualiza um registro de pagamento pelo ID externo
   * @param externalId ID externo do pagamento (Mercado Pago)
   * @param data Dados a serem atualizados
   * @returns Registro de pagamento atualizado
   */
  public async updateByExternalId(
    externalId: string,
    data: Partial<IPayment>
  ): Promise<IPayment> {
    try {
      // Verificar se o pagamento existe
      const existingPayment = await this.findByExternalId(externalId);
      if (!existingPayment) {
        throw new NotFoundError(
          `Pagamento com ID externo ${externalId} não encontrado`
        );
      }

      // Preparar metadados para o banco
      const updateData: any = {
        ...data,
        updated_at: new Date(),
      };

      if (data.metadata) {
        updateData.metadata = JSON.stringify(data.metadata);
      }

      // Atualizar o pagamento
      const payment = await this.prisma.payment.update({
        where: { external_id: externalId },
        data: updateData,
      });

      // Invalidar cache
      await this.cache.delete(`${this.CACHE_PREFIX}${payment.id}`);
      await this.cache.delete(`${this.CACHE_PREFIX}external:${externalId}`);

      // Converter os dados de volta para o formato esperado
      return this.convertPaymentFromDatabase(payment);
    } catch (error) {
      logger.logError(error as Error, "PaymentRepository.updateByExternalId", {
        externalId,
        data,
      });
      throw error;
    }
  }

  /**
   * Busca um pagamento pelo ID
   * @param id ID do pagamento
   * @returns Registro de pagamento ou null se não encontrado
   */
  public async findById(id: string): Promise<IPayment | null> {
    try {
      // Tentar obter do cache primeiro
      return await this.cache.getOrSet(
        `${this.CACHE_PREFIX}${id}`,
        async () => {
          const payment = await this.prisma.payment.findUnique({
            where: { id },
          });

          if (!payment) return null;

          return this.convertPaymentFromDatabase(payment);
        },
        3600 // 1 hora de cache
      );
    } catch (error) {
      logger.logError(error as Error, "PaymentRepository.findById", { id });
      throw error;
    }
  }

  /**
   * Busca um pagamento pelo ID externo (Mercado Pago)
   * @param externalId ID externo do pagamento
   * @returns Registro de pagamento ou null se não encontrado
   */
  public async findByExternalId(externalId: string): Promise<IPayment | null> {
    try {
      // Tentar obter do cache primeiro
      return await this.cache.getOrSet(
        `${this.CACHE_PREFIX}external:${externalId}`,
        async () => {
          const payment = await this.prisma.payment.findUnique({
            where: { external_id: externalId },
          });

          if (!payment) return null;

          return this.convertPaymentFromDatabase(payment);
        },
        3600 // 1 hora de cache
      );
    } catch (error) {
      logger.logError(error as Error, "PaymentRepository.findByExternalId", {
        externalId,
      });
      throw error;
    }
  }

  /**
   * Lista pagamentos com filtros
   * @param filters Filtros para a listagem
   * @returns Lista de pagamentos e contagem total
   */
  public async findAll(
    filters: IPaymentFilters
  ): Promise<{ payments: IPayment[]; total: number }> {
    try {
      const {
        user_id,
        status,
        payment_type,
        start_date,
        end_date,
        page = 1,
        limit = 10,
      } = filters;

      const where: any = {};

      if (user_id !== undefined) {
        where.user_id = user_id;
      }

      if (status !== undefined) {
        where.status = status;
      }

      if (payment_type !== undefined) {
        where.payment_type = payment_type;
      }

      if (start_date || end_date) {
        where.created_at = {};

        if (start_date) {
          where.created_at.gte = start_date;
        }

        if (end_date) {
          where.created_at.lte = end_date;
        }
      }

      const skip = (page - 1) * limit;

      // Usar chave de cache baseada nos filtros
      const cacheKey = `${this.CACHE_PREFIX}list:${JSON.stringify({
        where,
        skip,
        limit,
      })}`;

      return await this.cache.getOrSet(
        cacheKey,
        async () => {
          const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
              where,
              orderBy: { created_at: "desc" },
              skip,
              take: limit,
            }),
            this.prisma.payment.count({ where }),
          ]);

          // Converter os dados de volta para o formato esperado
          const formattedPayments = payments.map((payment) =>
            this.convertPaymentFromDatabase(payment)
          );

          return {
            payments: formattedPayments,
            total,
          };
        },
        300 // 5 minutos de cache para listas
      );
    } catch (error) {
      logger.logError(error as Error, "PaymentRepository.findAll", { filters });
      throw error;
    }
  }

  /**
   * Converte um registro de pagamento do banco para o formato da interface
   * @param payment Registro de pagamento do banco
   * @returns Pagamento no formato esperado
   */
  private convertPaymentFromDatabase(payment: any): IPayment {
    return {
      ...payment,
      metadata: payment.metadata
        ? JSON.parse(payment.metadata as string)
        : undefined,
    };
  }
}
