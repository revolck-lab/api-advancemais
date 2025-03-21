/**
 * Interfaces relacionadas à autenticação e autorização
 */

/**
 * Dados do usuário autenticado incluídos no token JWT
 */
export interface UserPayload {
  id: number;
  email: string;
  name: string;
  role: {
    id: number;
    name: string;
    level: number;
  };
  isCompany: boolean;
  companyId?: number;
  exp?: number; // Expiração do token
  iat?: number; // Data de emissão do token
}

/**
 * Dados para login de usuário ou empresa
 */
export interface LoginDTO {
  email: string;
  password: string;
  isCompany?: boolean; // Indica se é login de empresa
}

/**
 * Dados para registro de usuários comuns (alunos)
 */
export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  birth_date: string;
  cpf: string;
  phone_user: string;
  gender_id: number;
  education_id: number;
  address: {
    address: string;
    city: string;
    state: string;
    cep: string;
    number: number;
  };
}

/**
 * Dados para registro de empresas
 */
export interface RegisterCompanyDTO {
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
 * Resposta após autenticação bem-sucedida
 */
export interface AuthResponse {
  user: {
    id: number;
    name: string;
    email: string;
    role: {
      id: number;
      name: string;
      level: number;
    };
    isCompany: boolean;
    companyId?: number;
  };
  token: string;
  expiresIn: number;
}

/**
 * Dados para criação de usuários pelo administrador
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  birth_date: string;
  cpf: string;
  phone_user: string;
  gender_id: number;
  education_id: number;
  role_id: number;
  status?: number;
  address: {
    address: string;
    city: string;
    state: string;
    cep: string;
    number: number;
  };
}
