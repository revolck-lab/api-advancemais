// src/services/company-service/validations/company.validation.ts

import { ValidationError } from "@shared/errors/app-error";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateCompanyStatusDTO,
} from "../interfaces/company.interface";

/**
 * Classe para validação de dados de empresas
 * Centraliza todas as validações de dados relacionados a empresas
 */
export class CompanyValidation {
  /**
   * Valida dados de criação de empresa
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateCreate(data: any): CreateCompanyDTO {
    const errors: Record<string, string[]> = {};

    // Validação de campos obrigatórios
    const requiredFields = [
      "trade_name",
      "business_name",
      "cnpj",
      "contact_name",
      "email",
      "whatsapp",
      "mobile_phone",
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        errors[field] = [`${field} é obrigatório`];
      }
    }

    // Validação de CNPJ
    if (data.cnpj && !this.isValidCnpj(data.cnpj)) {
      errors.cnpj = errors.cnpj || [];
      errors.cnpj.push("CNPJ inválido");
    }

    // Validação de email
    if (data.email && !this.isValidEmail(data.email)) {
      errors.email = errors.email || [];
      errors.email.push("Email inválido");
    }

    // Validação de telefones
    if (data.whatsapp && !this.isValidPhone(data.whatsapp)) {
      errors.whatsapp = errors.whatsapp || [];
      errors.whatsapp.push("WhatsApp inválido");
    }

    if (data.mobile_phone && !this.isValidPhone(data.mobile_phone)) {
      errors.mobile_phone = errors.mobile_phone || [];
      errors.mobile_phone.push("Telefone celular inválido");
    }

    if (data.landline_phone && !this.isValidPhone(data.landline_phone)) {
      errors.landline_phone = errors.landline_phone || [];
      errors.landline_phone.push("Telefone fixo inválido");
    }

    // Validação de endereço
    if (!data.address) {
      errors.address = ["Endereço é obrigatório"];
    } else {
      const addressRequiredFields = [
        "address",
        "city",
        "state",
        "cep",
        "number",
      ];
      for (const field of addressRequiredFields) {
        if (!data.address[field]) {
          errors[`address.${field}`] = [`${field} do endereço é obrigatório`];
        }
      }

      // Validação de CEP
      if (data.address.cep && !this.isValidCep(data.address.cep)) {
        errors["address.cep"] = errors["address.cep"] || [];
        errors["address.cep"].push("CEP inválido");
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de empresa inválidos", errors);
    }

    return data as CreateCompanyDTO;
  }

  /**
   * Valida dados de atualização de empresa
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateUpdate(data: any): UpdateCompanyDTO {
    const errors: Record<string, string[]> = {};

    // Se não há dados para atualizar
    if (Object.keys(data).length === 0) {
      throw new ValidationError("Nenhum dado enviado para atualização", {
        general: ["Forneça pelo menos um campo para atualização"],
      });
    }

    // Validação de email (se fornecido)
    if (data.email && !this.isValidEmail(data.email)) {
      errors.email = errors.email || [];
      errors.email.push("Email inválido");
    }

    // Validação de telefones (se fornecidos)
    if (data.whatsapp && !this.isValidPhone(data.whatsapp)) {
      errors.whatsapp = errors.whatsapp || [];
      errors.whatsapp.push("WhatsApp inválido");
    }

    if (data.mobile_phone && !this.isValidPhone(data.mobile_phone)) {
      errors.mobile_phone = errors.mobile_phone || [];
      errors.mobile_phone.push("Telefone celular inválido");
    }

    if (data.landline_phone && !this.isValidPhone(data.landline_phone)) {
      errors.landline_phone = errors.landline_phone || [];
      errors.landline_phone.push("Telefone fixo inválido");
    }

    // Validação de endereço (se fornecido)
    if (data.address) {
      // Validação de CEP (se fornecido)
      if (data.address.cep && !this.isValidCep(data.address.cep)) {
        errors["address.cep"] = errors["address.cep"] || [];
        errors["address.cep"].push("CEP inválido");
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de atualização inválidos", errors);
    }

    return data as UpdateCompanyDTO;
  }

  /**
   * Valida dados de atualização de status de empresa
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateStatusUpdate(data: any): UpdateCompanyStatusDTO {
    const errors: Record<string, string[]> = {};

    if (data.status === undefined) {
      errors.status = ["Status é obrigatório"];
    } else if (![0, 1].includes(data.status)) {
      errors.status = ["Status deve ser 0 (inativo) ou 1 (ativo)"];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de status inválidos", errors);
    }

    return data as UpdateCompanyStatusDTO;
  }

  /**
   * Valida filtros para listagem de empresas
   * @param data Filtros a serem validados
   * @returns Filtros validados
   */
  static validateFilters(data: any): any {
    const filters: any = {};

    // Validação de status (se fornecido)
    if (data.status !== undefined) {
      filters.status = Number(data.status);
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
   * Verifica se um CNPJ é válido (simplificado)
   * @param cnpj CNPJ a ser verificado
   * @returns true se o CNPJ for válido
   */
  private static isValidCnpj(cnpj: string): boolean {
    // Implementação simplificada - apenas verificação de formato
    return /^\d{14}$/.test(cnpj);
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

  /**
   * Verifica se um telefone é válido
   * @param phone Telefone a ser verificado
   * @returns true se o telefone for válido
   */
  private static isValidPhone(phone: string): boolean {
    // Aceita formatos como: 11999999999, (11)99999-9999, etc.
    return /^\d{10,11}$/.test(phone.replace(/\D/g, ""));
  }

  /**
   * Verifica se um CEP é válido
   * @param cep CEP a ser verificado
   * @returns true se o CEP for válido
   */
  private static isValidCep(cep: string): boolean {
    return /^\d{8}$/.test(cep.replace(/\D/g, ""));
  }
}
