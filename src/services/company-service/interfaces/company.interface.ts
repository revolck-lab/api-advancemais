// src/services/company-service/interfaces/company.interface.ts

/**
 * Interface para dados de criação de empresa
 */
export interface CreateCompanyDTO {
  trade_name: string;
  business_name: string;
  cnpj: string;
  contact_name: string;
  email: string;
  password: string;
  whatsapp: string;
  mobile_phone: string;
  landline_phone?: string;
  address: {
    address: string;
    city: string;
    state: string;
    cep: string;
    number: number;
  };
}

/**
 * Interface para dados de atualização de empresa
 */
export interface UpdateCompanyDTO {
  trade_name?: string;
  business_name?: string;
  contact_name?: string;
  email?: string;
  whatsapp?: string;
  mobile_phone?: string;
  landline_phone?: string;
  address?: {
    address?: string;
    city?: string;
    state?: string;
    cep?: string;
    number?: number;
  };
}

/**
 * Interface para atualização de status de empresa
 */
export interface UpdateCompanyStatusDTO {
  status: number;
}

/**
 * Interface para filtros de listagem de empresas
 */
export interface CompanyFilters {
  status?: number;
  page?: number;
  limit?: number;
}

/**
 * Interface para resultado da listagem de empresas
 */
export interface CompanyListResult {
  companies: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
