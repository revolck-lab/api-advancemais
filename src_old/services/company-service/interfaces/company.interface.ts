import {
  AddressDTO,
  BaseFilters,
  PaginatedResult,
  PartialAddressDTO,
} from "./shared.interface";

/**
 * Interface para modelo completo de empresa
 */
export interface Company {
  /** ID da empresa */
  id: number;
  /** Nome fantasia */
  trade_name: string;
  /** Razão social */
  business_name: string;
  /** CNPJ (somente números) */
  cnpj: string;
  /** Nome do contato principal */
  contact_name: string;
  /** Email corporativo */
  email: string;
  /** Número do WhatsApp */
  whatsapp: string;
  /** Número de celular */
  mobile_phone: string;
  /** Número de telefone fixo (opcional) */
  landline_phone?: string;
  /** Informações de endereço */
  address: AddressDTO;
  /** Status da empresa (1=ativo, 0=inativo) */
  status: number;
  /** ID do perfil (role) */
  role_id: number;
  /** Data de criação */
  created_at: Date;
  /** Data da última atualização */
  updated_at: Date;
}

/**
 * Interface para dados de criação de empresa
 */
export interface CreateCompanyDTO {
  /** Nome fantasia */
  trade_name: string;
  /** Razão social */
  business_name: string;
  /** CNPJ (somente números) */
  cnpj: string;
  /** Nome do contato principal */
  contact_name: string;
  /** Email corporativo */
  email: string;
  /** Senha para acesso */
  password: string;
  /** Número do WhatsApp */
  whatsapp: string;
  /** Número de celular */
  mobile_phone: string;
  /** Número de telefone fixo (opcional) */
  landline_phone?: string;
  /** Informações de endereço */
  address: AddressDTO;
}

/**
 * Interface para dados de atualização de empresa
 * Todos os campos são opcionais para permitir atualização parcial
 */
export interface UpdateCompanyDTO {
  /** Nome fantasia */
  trade_name?: string;
  /** Razão social */
  business_name?: string;
  /** Nome do contato principal */
  contact_name?: string;
  /** Email corporativo */
  email?: string;
  /** Número do WhatsApp */
  whatsapp?: string;
  /** Número de celular */
  mobile_phone?: string;
  /** Número de telefone fixo (opcional) */
  landline_phone?: string;
  /** Informações de endereço (parcial) */
  address?: PartialAddressDTO;
}

/**
 * Interface para atualização de status de empresa
 */
export interface UpdateCompanyStatusDTO {
  /** Status da empresa (1=ativo, 0=inativo) */
  status: number;
}

/**
 * Interface para filtros de listagem de empresas
 */
export interface CompanyFilters extends BaseFilters {
  /** Filtro por status */
  status?: number;
  /** Busca por nome ou CNPJ */
  search?: string;
}

/**
 * Interface para resultado da listagem de empresas
 */
export interface CompanyListResult extends PaginatedResult<Company> {
  /** Renomear items para companies para manter retrocompatibilidade */
  items: never;
  /** Lista de empresas */
  companies: Company[];
}
