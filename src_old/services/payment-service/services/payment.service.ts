// src/services/payment-service/services/payment.service.ts

import { PrismaClient } from "@prisma/client";
import {
  ICreatePaymentDTO,
  IPayment,
  IPaymentFilters,
  PaymentStatus,
} from "../interfaces/payment.interface";
import { PaymentRepository } from "../repositories/payment.repository";
import { PaymentValidation } from "../validations/payment.validation";
import { MercadoPagoService } from "../mercadopago/mercadopago.service";
import { ICache, defaultCache } from "@shared/utils/cache";
import {
  AppError,
  NotFoundError,
  ConflictError,
} from "@shared/errors/app-error";
import { ErrorLogger } from "@shared/utils/error-logger";

const logger = ErrorLogger.getInstance();

/**
 * Serviço de pagamentos
 * Centraliza a lógica de negócios relacionada a pagamentos
 */
export class PaymentService {
  private paymentRepository: PaymentRepository;
  private mercadoPagoService: MercadoPagoService;

  /**
   * Construtor do serviço de pagamentos
   * @param prisma Instância do cliente Prisma
   * @param cache Instância do cache (opcional)
   */
  constructor(prisma: PrismaClient, cache: ICache = defaultCache) {
    this.paymentRepository = new PaymentRepository(prisma, cache);
    this.mercadoPagoService = new MercadoPagoService();
  }

  /**
   * Cria um novo pagamento
   * @param data Dados para criação do pagamento
   * @returns Pagamento criado com informações completas
   */
  public async createPayment(data: ICreatePaymentDTO): Promise<IPayment> {
    try {
      // Validar dados de entrada
      const validatedData = PaymentValidation.validateCreatePayment(data);

      // 1. Criar o pagamento no Mercado Pago
      const mercadoPagoResult = await this.mercadoPagoService.createPayment(
        validatedData
      );

      // 2. Salvar os dados do pagamento no banco de dados
      const paymentData: Omit<IPayment, "id" | "created_at" | "updated_at"> = {
        user_id: validatedData.user_id,
        amount: mercadoPagoResult.transaction_amount,
        currency: validatedData.currency || "BRL",
        description: mercadoPagoResult.description,
        status: mercadoPagoResult.status,
        payment_method: mercadoPagoResult.payment_method_id,
        payment_type: validatedData.payment_type,
        external_id: mercadoPagoResult.external_id,
        metadata: {
          ...mercadoPagoResult.metadata,
          payment_details: {
            installments: mercadoPagoResult.installments,
            processing_mode: mercadoPagoResult.processing_mode,
            transaction_details: mercadoPagoResult.transaction_details,
            point_of_interaction: mercadoPagoResult.point_of_interaction,
          },
        },
      };

      const payment = await this.paymentRepository.create(paymentData);
      return payment;
    } catch (error) {
      logger.logError(error as Error, "PaymentService.createPayment", { data });
      throw error;
    }
  }

  /**
   * Consulta um pagamento pelo ID
   * @param id ID do pagamento
   * @returns Dados do pagamento
   */
  public async getPayment(id: string): Promise<IPayment> {
    try {
      const payment = await this.paymentRepository.findById(id);

      if (!payment) {
        throw new NotFoundError(`Pagamento com ID ${id} não encontrado`);
      }

      return payment;
    } catch (error) {
      logger.logError(error as Error, "PaymentService.getPayment", { id });
      throw error;
    }
  }

  /**
   * Consulta um pagamento pelo ID externo (Mercado Pago)
   * @param externalId ID externo do pagamento
   * @returns Dados do pagamento
   */
  public async getPaymentByExternalId(externalId: string): Promise<IPayment> {
    try {
      const payment = await this.paymentRepository.findByExternalId(externalId);

      if (!payment) {
        throw new NotFoundError(
          `Pagamento com ID externo ${externalId} não encontrado`
        );
      }

      return payment;
    } catch (error) {
      logger.logError(error as Error, "PaymentService.getPaymentByExternalId", {
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
  public async listPayments(
    filters: IPaymentFilters
  ): Promise<{ payments: IPayment[]; total: number }> {
    try {
      // Validar e normalizar filtros
      const validatedFilters = PaymentValidation.validateFilters(filters);

      return this.paymentRepository.findAll(validatedFilters);
    } catch (error) {
      logger.logError(error as Error, "PaymentService.listPayments", {
        filters,
      });
      throw error;
    }
  }

  /**
   * Cancela um pagamento pendente
   * @param id ID do pagamento
   * @param data Dados adicionais do cancelamento (opcional)
   * @returns Pagamento atualizado
   */
  public async cancelPayment(id: string, data: any = {}): Promise<IPayment> {
    try {
      // 1. Verificar se o pagamento existe
      const payment = await this.paymentRepository.findById(id);

      if (!payment) {
        throw new NotFoundError(`Pagamento com ID ${id} não encontrado`);
      }

      // 2. Validar se o pagamento pode ser cancelado
      PaymentValidation.validateCancelPayment(data, payment.status);

      // 3. Cancelar o pagamento no Mercado Pago
      await this.mercadoPagoService.cancelPayment(payment.external_id!);

      // 4. Atualizar o status no banco de dados
      const updatedPayment = await this.paymentRepository.update(id, {
        status: PaymentStatus.CANCELLED,
        metadata: {
          ...payment.metadata,
          cancellation_reason: data.reason || "Cancelado pelo usuário",
          cancelled_at: new Date().toISOString(),
          cancelled_by: data.user_id,
        },
      });

      return updatedPayment;
    } catch (error) {
      logger.logError(error as Error, "PaymentService.cancelPayment", {
        id,
        data,
      });
      throw error;
    }
  }

  /**
   * Reembolsa um pagamento aprovado
   * @param id ID do pagamento
   * @param data Dados adicionais do reembolso (opcional)
   * @returns Pagamento atualizado
   */
  public async refundPayment(id: string, data: any = {}): Promise<IPayment> {
    try {
      // 1. Verificar se o pagamento existe
      const payment = await this.paymentRepository.findById(id);

      if (!payment) {
        throw new NotFoundError(`Pagamento com ID ${id} não encontrado`);
      }

      // 2. Validar se o pagamento pode ser reembolsado
      PaymentValidation.validateRefundPayment(data, payment.status);

      // 3. Reembolsar o pagamento no Mercado Pago
      await this.mercadoPagoService.refundPayment(payment.external_id!);

      // 4. Atualizar o status no banco de dados
      const updatedPayment = await this.paymentRepository.update(id, {
        status: PaymentStatus.REFUNDED,
        metadata: {
          ...payment.metadata,
          refund_reason: data.reason || "Reembolsado pelo administrador",
          refunded_at: new Date().toISOString(),
          refunded_by: data.user_id,
          refund_amount: data.amount || payment.amount,
        },
      });

      return updatedPayment;
    } catch (error) {
      logger.logError(error as Error, "PaymentService.refundPayment", {
        id,
        data,
      });
      throw error;
    }
  }

  /**
   * Atualiza o status de um pagamento com base em uma notificação
   * @param externalId ID externo do pagamento (Mercado Pago)
   * @returns Pagamento atualizado
   */
  public async updatePaymentStatus(externalId: string): Promise<IPayment> {
    try {
      // 1. Consultar o pagamento no Mercado Pago
      const mpPayment = await this.mercadoPagoService.getPayment(externalId);

      // 2. Verificar se o pagamento existe no banco de dados
      const payment = await this.paymentRepository.findByExternalId(externalId);

      if (!payment) {
        throw new NotFoundError(
          `Pagamento com ID externo ${externalId} não encontrado`
        );
      }

      // 3. Atualizar o status e metadados
      const updatedPayment = await this.paymentRepository.updateByExternalId(
        externalId,
        {
          status: mpPayment.status,
          metadata: {
            ...payment.metadata,
            last_update: new Date().toISOString(),
            status_detail: mpPayment.status_detail,
            transaction_details: mpPayment.transaction_details,
          },
        }
      );

      return updatedPayment;
    } catch (error) {
      logger.logError(error as Error, "PaymentService.updatePaymentStatus", {
        externalId,
      });
      throw error;
    }
  }

  /**
   * Processa uma notificação webhook do Mercado Pago
   * @param data Dados recebidos no webhook
   * @returns Resultado do processamento
   */
  public async processWebhook(
    data: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!data.action || !data.data) {
        return { success: false, message: "Dados de webhook inválidos" };
      }

      const action = data.action;
      const resourceId = data.data.id;

      // Registrar informação sobre o webhook recebido
      logger.logInfo(
        `Webhook recebido: ${action}`,
        "PaymentService.processWebhook",
        {
          action,
          resourceId,
          data: process.env.NODE_ENV === "development" ? data : undefined,
        }
      );

      if (action === "payment.updated" || action === "payment.created") {
        // Atualizar pagamento
        await this.updatePaymentStatus(resourceId);
        return {
          success: true,
          message: `Pagamento ${resourceId} atualizado com sucesso`,
        };
      }

      return {
        success: true,
        message: `Ação ${action} recebida, mas não processada`,
      };
    } catch (error) {
      logger.logError(error as Error, "PaymentService.processWebhook", {
        data,
      });
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao processar webhook",
      };
    }
  }
}
