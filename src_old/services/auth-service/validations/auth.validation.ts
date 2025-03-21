import {
  LoginDTO,
  RegisterUserDTO,
  RegisterCompanyDTO,
  CreateUserDTO,
} from "@shared/interfaces/auth.interface";
import { ValidationError } from "@shared/errors/app-error";

/**
 * Classe para validação de dados de autenticação
 * Centraliza todas as validações de dados relacionados à autenticação
 */
export class AuthValidation {
  /**
   * Valida dados de login
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateLogin(data: any): LoginDTO {
    const errors: Record<string, string[]> = {};

    if (!data.email) {
      errors.email = errors.email || [];
      errors.email.push("Email é obrigatório");
    } else if (!this.isValidEmail(data.email)) {
      errors.email = errors.email || [];
      errors.email.push("Email inválido");
    }

    if (!data.password) {
      errors.password = errors.password || [];
      errors.password.push("Senha é obrigatória");
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de login inválidos", errors);
    }

    return {
      email: data.email,
      password: data.password,
      isCompany: data.isCompany || false,
    };
  }

  /**
   * Valida dados de registro de usuário
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateRegisterUser(data: any): RegisterUserDTO {
    const errors: Record<string, string[]> = {};

    // Validação de campos obrigatórios
    [
      "name",
      "email",
      "password",
      "cpf",
      "birth_date",
      "phone_user",
      "gender_id",
      "education_id",
    ].forEach((field) => {
      if (!data[field]) {
        errors[field] = errors[field] || [];
        errors[field].push(`${field} é obrigatório`);
      }
    });

    // Validação de email
    if (data.email && !this.isValidEmail(data.email)) {
      errors.email = errors.email || [];
      errors.email.push("Email inválido");
    }

    // Validação de CPF
    if (data.cpf && !this.isValidCpf(data.cpf)) {
      errors.cpf = errors.cpf || [];
      errors.cpf.push("CPF inválido");
    }

    // Validação de endereço
    if (!data.address) {
      errors.address = ["Endereço é obrigatório"];
    } else {
      ["address", "city", "state", "cep", "number"].forEach((field) => {
        if (!data.address[field]) {
          errors[`address.${field}`] = [`${field} do endereço é obrigatório`];
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de registro inválidos", errors);
    }

    return data as RegisterUserDTO;
  }

  /**
   * Valida dados de registro de empresa
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateRegisterCompany(data: any): RegisterCompanyDTO {
    const errors: Record<string, string[]> = {};

    // Validação de campos obrigatórios
    [
      "trade_name",
      "business_name",
      "contact_name",
      "email",
      "password",
      "cnpj",
      "whatsapp",
      "mobile_phone",
    ].forEach((field) => {
      if (!data[field]) {
        errors[field] = errors[field] || [];
        errors[field].push(`${field} é obrigatório`);
      }
    });

    // Validação de email
    if (data.email && !this.isValidEmail(data.email)) {
      errors.email = errors.email || [];
      errors.email.push("Email inválido");
    }

    // Validação de CNPJ
    if (data.cnpj && !this.isValidCnpj(data.cnpj)) {
      errors.cnpj = errors.cnpj || [];
      errors.cnpj.push("CNPJ inválido");
    }

    // Validação de endereço
    if (!data.address) {
      errors.address = ["Endereço é obrigatório"];
    } else {
      ["address", "city", "state", "cep", "number"].forEach((field) => {
        if (!data.address[field]) {
          errors[`address.${field}`] = [`${field} do endereço é obrigatório`];
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Dados de registro inválidos", errors);
    }

    return data as RegisterCompanyDTO;
  }

  /**
   * Valida dados de criação de usuário pelo administrador
   * @param data Dados a serem validados
   * @throws ValidationError se os dados forem inválidos
   */
  static validateCreateUser(data: any): CreateUserDTO {
    const errors: Record<string, string[]> = {};

    // Validação de campos obrigatórios
    [
      "name",
      "email",
      "password",
      "cpf",
      "role_id",
      "birth_date",
      "phone_user",
      "gender_id",
      "education_id",
    ].forEach((field) => {
      if (!data[field]) {
        errors[field] = errors[field] || [];
        errors[field].push(`${field} é obrigatório`);
      }
    });

    // Validação de email
    if (data.email && !this.isValidEmail(data.email)) {
      errors.email = errors.email || [];
      errors.email.push("Email inválido");
    }

    // Validação de CPF
    if (data.cpf && !this.isValidCpf(data.cpf)) {
      errors.cpf = errors.cpf || [];
      errors.cpf.push("CPF inválido");
    }

    // Validação de endereço
    if (!data.address) {
      errors.address = ["Endereço é obrigatório"];
    } else {
      ["address", "city", "state", "cep", "number"].forEach((field) => {
        if (!data.address[field]) {
          errors[`address.${field}`] = [`${field} do endereço é obrigatório`];
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(
        "Dados de criação de usuário inválidos",
        errors
      );
    }

    return data as CreateUserDTO;
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
   * Verifica se um CPF é válido (simplificado)
   * @param cpf CPF a ser verificado
   * @returns true se o CPF for válido
   */
  private static isValidCpf(cpf: string): boolean {
    // Implementação simplificada - apenas verificação de formato
    return /^\d{11}$/.test(cpf);
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
}
