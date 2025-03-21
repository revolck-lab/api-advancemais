// src/services/payment-service/validations/payment.validation.ts

import { ValidationError } from "@shared/errors/app-error";
import {
  ICreatePaymentDTO,
  PaymentStatus,
  PaymentType,
} from "../interfaces/payment.interface";

/**
 * Classe para validação de dados de pagamentos
 * Centraliza todas as validações de dados relacionados a pagamentos
 */
export class PaymentValidation {
  /**
   * Valida dados de criação de pagamento
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateCreatePayment(data: any): ICreatePaymentDTO {
    const errors: Record<string, string[]> = {};

    // Validação de campos obrigatórios
    const requiredFields = [
      "user_id",
      "amount",
      "description",
      "payment_method",
      "payment_type",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        errors[field] = [`${field} é obrigatório`];
      }
    }

    // Validação de campos numéricos
    if (
      data.user_id !== undefined &&
      (!Number.isInteger(data.user_id) || data.user_id <= 0)
    ) {
      errors.user_id = errors.user_id || [];
      errors.user_id.push("ID do usuário deve ser um número inteiro positivo");
    }

    if (data.amount !== undefined) {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = ["Valor deve ser um número positivo"];
      }
    }

    if (data.installments !== undefined) {
      const installments = parseInt(data.installments, 10);
      if (isNaN(installments) || installments <= 0 || installments > 12) {
        errors.installments = [
          "Número de parcelas deve ser um número inteiro entre 1 e 12",
        ];
      }
    }

    // Validação de tipos enumerados
    if (data.payment_type) {
      const validTypes = Object.values(PaymentType);
      if (!validTypes.includes(data.payment_type)) {
        errors.payment_type = [
          `Tipo de pagamento inválido. Valores válidos: ${validTypes.join(
            ", "
          )}`,
        ];
      }
    }

    // Validação do payer (pagador)
    if (data.payer) {
      if (!data.payer.email) {
        errors["payer.email"] = ["Email do pagador é obrigatório"];
      } else if (!this.isValidEmail(data.payer.email)) {
        errors["payer.email"] = ["Email do pagador inválido"];
      }

      // Validação de identificação do pagador (se fornecida)
      if (data.payer.identification) {
        if (!data.payer.identification.type) {
          errors["payer.identification.type"] = [
            "Tipo de identificação do pagador é obrigatório",
          ];
        }

        if (!data.payer.identification.number) {
          errors["payer.identification.number"] = [
            "Número de identificação do pagador é obrigatório",
          ];
        }
      }
    }

    // Validação de cartão (se fornecido e se for pagamento com cartão)
    if (
      (data.payment_type === PaymentType.CREDIT_CARD ||
        data.payment_type === PaymentType.DEBIT_CARD) &&
      (!data.card || !data.card.token)
    ) {
      errors.card = errors.card || [];
      errors.card.push(
        "Token do cartão é obrigatório para pagamentos com cartão"
      );
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de pagamento inválidos", errors);
    }

    return data as ICreatePaymentDTO;
  }

  /**
   * Valida dados de cancelamento de pagamento
   * @param data Dados a serem validados
   * @param currentStatus Status atual do pagamento
   * @throws ValidationError se os dados forem inválidos
   */
  static validateCancelPayment(data: any, currentStatus?: string): void {
    const errors: Record<string, string[]> = {};

    // Verificar se o status atual permite cancelamento
    if (currentStatus) {
      const cancelableStatuses = [
        PaymentStatus.PENDING,
        PaymentStatus.IN_PROCESS,
      ];
      if (!cancelableStatuses.includes(currentStatus as PaymentStatus)) {
        errors.status = [
          `Pagamento com status '${currentStatus}' não pode ser cancelado`,
        ];
      }
    }

    // Validar motivo do cancelamento (se fornecido)
    if (data.reason && typeof data.reason !== "string") {
      errors.reason = ["Motivo do cancelamento deve ser um texto"];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de cancelamento inválidos", errors);
    }
  }

  /**
   * Valida dados de reembolso de pagamento
   * @param data Dados a serem validados
   * @param currentStatus Status atual do pagamento
   * @throws ValidationError se os dados forem inválidos
   */
  static validateRefundPayment(data: any, currentStatus?: string): void {
    const errors: Record<string, string[]> = {};

    // Verificar se o status atual permite reembolso
    if (currentStatus) {
      if (currentStatus !== PaymentStatus.APPROVED) {
        errors.status = ["Apenas pagamentos aprovados podem ser reembolsados"];
      }
    }

    // Validar motivo do reembolso (se fornecido)
    if (data.reason && typeof data.reason !== "string") {
      errors.reason = ["Motivo do reembolso deve ser um texto"];
    }

    // Validar valor parcial (se fornecido)
    if (data.amount !== undefined) {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.amount = ["Valor de reembolso deve ser um número positivo"];
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de reembolso inválidos", errors);
    }
  }

  /**
   * Valida filtros para listagem de pagamentos
   * @param data Filtros a serem validados
   * @returns Filtros validados
   */
  static validateFilters(data: any): any {
    const filters: any = {};

    // Validação de user_id (se fornecido)
    if (data.user_id !== undefined) {
      const userId = Number(data.user_id);
      if (!isNaN(userId) && userId > 0) {
        filters.user_id = userId;
      }
    }

    // Validação de status (se fornecido)
    if (data.status !== undefined) {
      const validStatuses = Object.values(PaymentStatus);
      if (validStatuses.includes(data.status as PaymentStatus)) {
        filters.status = data.status;
      }
    }

    // Validação de payment_type (se fornecido)
    if (data.payment_type !== undefined) {
      const validTypes = Object.values(PaymentType);
      if (validTypes.includes(data.payment_type as PaymentType)) {
        filters.payment_type = data.payment_type;
      }
    }

    // Validação de datas (se fornecidas)
    if (data.start_date && !isNaN(Date.parse(data.start_date))) {
      filters.start_date = new Date(data.start_date);
    }

    if (data.end_date && !isNaN(Date.parse(data.end_date))) {
      filters.end_date = new Date(data.end_date);
    }

    // Validação de paginação
    if (data.page) {
      const page = Number(data.page);
      filters.page = isNaN(page) || page < 1 ? 1 : page;
    }

    if (data.limit) {
      const limit = Number(data.limit);
      filters.limit = isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);
    }

    return filters;
  }

  /**
   * Verifica se um email é válido
   * @param email Email a ser verificado
   * @returns true se o email for válido
   */
  private static isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
