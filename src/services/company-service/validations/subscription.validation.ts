// src/services/company-service/validations/subscription.validation.ts

import { ValidationError } from "@shared/errors/app-error";
import {
  CreateCompanySubscriptionDTO,
  UpdateSubscriptionDTO,
  CancelSubscriptionDTO,
} from "../interfaces/subscription.interface";

/**
 * Classe para validação de dados de assinaturas
 * Centraliza todas as validações de dados relacionados a assinaturas de empresas
 */
export class SubscriptionValidation {
  /**
   * Valida dados de criação de assinatura
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateCreate(data: any): CreateCompanySubscriptionDTO {
    const errors: Record<string, string[]> = {};

    // Validação de campos obrigatórios
    const requiredFields = ["company_id", "plan_id", "payment_method_id"];

    for (const field of requiredFields) {
      if (data[field] === undefined) {
        errors[field] = [`${field} é obrigatório`];
      }
    }

    // Validação de campos numéricos
    if (
      data.company_id !== undefined &&
      (!Number.isInteger(data.company_id) || data.company_id <= 0)
    ) {
      errors.company_id = errors.company_id || [];
      errors.company_id.push(
        "ID da empresa deve ser um número inteiro positivo"
      );
    }

    // Validação de campos booleanos
    if (
      data.auto_recurring !== undefined &&
      typeof data.auto_recurring !== "boolean"
    ) {
      errors.auto_recurring = ["auto_recurring deve ser um valor booleano"];
    }

    // Validação de isenção
    if (data.is_exempted === true) {
      // Se for isento, deve ter motivo de isenção
      if (!data.exemption_reason) {
        errors.exemption_reason = [
          "Motivo da isenção é obrigatório quando is_exempted é true",
        ];
      }

      // Se for isento, deve ter quem isentou
      if (!data.exempted_by) {
        errors.exempted_by = [
          "ID do usuário que concedeu a isenção é obrigatório quando is_exempted é true",
        ];
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de assinatura inválidos", errors);
    }

    return data as CreateCompanySubscriptionDTO;
  }

  /**
   * Valida dados de atualização de assinatura
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateUpdate(data: any): UpdateSubscriptionDTO {
    const errors: Record<string, string[]> = {};

    // Se não há dados para atualizar
    if (Object.keys(data).length === 0) {
      throw new ValidationError("Nenhum dado enviado para atualização", {
        general: ["Forneça pelo menos um campo para atualização"],
      });
    }

    // Validação de status (se fornecido)
    const validStatuses = [
      "pending",
      "authorized",
      "active",
      "paused",
      "cancelled",
      "ended",
      "payment_failed",
    ];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.status = [
        `Status inválido. Deve ser um dos seguintes: ${validStatuses.join(
          ", "
        )}`,
      ];
    }

    // Validação de datas (se fornecidas)
    if (data.end_date && isNaN(Date.parse(data.end_date))) {
      errors.end_date = ["Data de término inválida"];
    }

    if (data.next_payment_date && isNaN(Date.parse(data.next_payment_date))) {
      errors.next_payment_date = ["Data do próximo pagamento inválida"];
    }

    // Validação de isenção
    if (data.is_exempted === true) {
      // Se for isento, deve ter motivo de isenção
      if (!data.exemption_reason) {
        errors.exemption_reason = [
          "Motivo da isenção é obrigatório quando is_exempted é true",
        ];
      }

      // Se for isento, deve ter quem isentou
      if (!data.exempted_by) {
        errors.exempted_by = [
          "ID do usuário que concedeu a isenção é obrigatório quando is_exempted é true",
        ];
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de atualização inválidos", errors);
    }

    return data as UpdateSubscriptionDTO;
  }

  /**
   * Valida dados de cancelamento de assinatura
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateCancel(data: any): CancelSubscriptionDTO {
    // Não há campos obrigatórios para cancelamento,
    // apenas validamos o formato dos campos se estiverem presentes
    const errors: Record<string, string[]> = {};

    if (
      data.canceled_by !== undefined &&
      (!Number.isInteger(data.canceled_by) || data.canceled_by <= 0)
    ) {
      errors.canceled_by = [
        "ID do usuário que cancelou deve ser um número inteiro positivo",
      ];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de cancelamento inválidos", errors);
    }

    return data as CancelSubscriptionDTO;
  }

  /**
   * Valida filtros para listagem de assinaturas
   * @param data Filtros a serem validados
   * @returns Filtros validados
   */
  static validateFilters(data: any): any {
    const filters: any = {};

    // Validação de company_id (se fornecido)
    if (data.company_id !== undefined) {
      const companyId = Number(data.company_id);
      if (!isNaN(companyId) && companyId > 0) {
        filters.company_id = companyId;
      }
    }

    // Validação de status (se fornecido)
    if (data.status !== undefined) {
      filters.status = data.status;
    }

    // Validação de plan_id (se fornecido)
    if (data.plan_id !== undefined) {
      filters.plan_id = data.plan_id;
    }

    // Validação de is_exempted (se fornecido)
    if (data.is_exempted !== undefined) {
      filters.is_exempted = data.is_exempted === "true";
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
}
