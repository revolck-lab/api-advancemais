import { BaseFilters, PaginatedResult } from "./shared.interface";

/**
 * Enum para status possíveis de uma assinatura
 */
export enum SubscriptionStatus {
  /** Pendente de processamento/aprovação */
  PENDING = "pending",
  /** Autorizada, aguardando ativação */
  AUTHORIZED = "authorized",
  /** Ativa e em uso */
  ACTIVE = "active",
  /** Pausada temporariamente */
  PAUSED = "paused",
  /** Cancelada pelo usuário ou administrador */
  CANCELLED = "cancelled",
  /** Finalizada após período contratado */
  ENDED = "ended",
  /** Falha no pagamento */
  PAYMENT_FAILED = "payment_failed",
}

/**
 * Enum para frequência de pagamento
 */
export enum SubscriptionFrequency {
  /** Mensal */
  MONTHLY = "monthly",
  /** Bimestral */
  BIMONTHLY = "bimonthly",
  /** Trimestral */
  QUARTERLY = "quarterly",
  /** Semestral */
  BIANNUAL = "biannual",
  /** Anual */
  ANNUAL = "annual",
}

/**
 * Enum para tipo de frequência
 */
export enum FrequencyType {
  /** Em dias */
  DAYS = "days",
  /** Em meses */
  MONTHS = "months",
  /** Em anos */
  YEARS = "years",
}

/**
 * Interface para modelo completo de uma assinatura
 */
export interface Subscription {
  /** ID único da assinatura */
  id: string;
  /** ID da empresa assinante */
  company_id: number;
  /** ID do plano contratado */
  plan_id: string;
  /** Status atual da assinatura */
  status: SubscriptionStatus;
  /** Data de início da assinatura */
  start_date: Date;
  /** Data de término (se houver) */
  end_date?: Date;
  /** Data do próximo pagamento */
  next_payment_date?: Date;
  /** Método de pagamento utilizado */
  payment_method_id: string;
  /** Frequência de pagamento */
  frequency: SubscriptionFrequency;
  /** Tipo de frequência (dias, meses, anos) */
  frequency_type: FrequencyType;
  /** Se a assinatura renova automaticamente */
  auto_recurring: boolean;
  /** ID externo (do gateway de pagamento) */
  external_id?: string;
  /** Se a assinatura está isenta de pagamento */
  is_exempted?: boolean;
  /** Motivo da isenção (se for isenta) */
  exemption_reason?: string;
  /** ID do usuário que concedeu a isenção */
  exempted_by?: number;
  /** Metadados adicionais */
  metadata?: Record<string, any>;
  /** Data de criação */
  created_at: Date;
  /** Data da última atualização */
  updated_at: Date;
}

/**
 * Interface para modelo de plano de assinatura
 */
export interface SubscriptionPlan {
  /** ID único do plano */
  id: string;
  /** Nome do plano */
  name: string;
  /** Descrição do plano */
  description: string;
  /** Valor do plano */
  amount: number;
  /** Moeda (ex: BRL) */
  currency_id: string;
  /** Método de pagamento permitido */
  payment_type_id: string;
  /** Número de períodos para cobrança */
  frequency: number;
  /** Tipo de frequência (dias, meses, anos) */
  frequency_type: FrequencyType;
  /** Status do plano */
  status: string;
  /** Se renova automaticamente */
  auto_recurring: boolean;
  /** Número máximo de vagas ativas permitidas */
  active_jobs_limit: number;
  /** Se é um plano em destaque */
  is_featured: boolean;
  /** Número de vagas destacadas permitidas */
  featured_jobs: number;
  /** Se tem acesso ao painel avançado */
  has_advanced_dashboard: boolean;
  /** Nível do plano (1-4) */
  plan_level: number;
  /** Lista de recursos em formato JSON */
  features?: string;
  /** Data de criação */
  created_at: Date;
  /** Data da última atualização */
  updated_at: Date;
}

/**
 * Interface para dados de criação de assinatura de empresa
 */
export interface CreateCompanySubscriptionDTO {
  /** ID da empresa */
  company_id: number;
  /** ID do plano escolhido */
  plan_id: string;
  /** Método de pagamento */
  payment_method_id: string;
  /** Se renova automaticamente */
  auto_recurring: boolean;
  /** ID externo (opcional) */
  external_id?: string;
  /** Se está isenta de pagamento */
  is_exempted?: boolean;
  /** Motivo da isenção (obrigatório se is_exempted=true) */
  exemption_reason?: string;
  /** ID do usuário que concedeu a isenção (obrigatório se is_exempted=true) */
  exempted_by?: number;
}

/**
 * Interface para atualização de assinatura de empresa
 */
export interface UpdateSubscriptionDTO {
  /** Novo status da assinatura */
  status?: SubscriptionStatus;
  /** Nova data de término */
  end_date?: Date;
  /** Nova data do próximo pagamento */
  next_payment_date?: Date;
  /** Atualização de isenção */
  is_exempted?: boolean;
  /** Motivo da isenção (obrigatório se is_exempted=true) */
  exemption_reason?: string;
  /** ID do usuário que concedeu a isenção (obrigatório se is_exempted=true) */
  exempted_by?: number;
}

/**
 * Interface para cancelamento de assinatura
 */
export interface CancelSubscriptionDTO {
  /** Motivo do cancelamento */
  cancellation_reason?: string;
  /** ID do usuário que cancelou */
  canceled_by?: number;
}

/**
 * Interface para filtros de listagem de assinaturas
 */
export interface SubscriptionFilters extends BaseFilters {
  /** Filtrar por ID da empresa */
  company_id?: number;
  /** Filtrar por status */
  status?: SubscriptionStatus;
  /** Filtrar por ID do plano */
  plan_id?: string;
  /** Filtrar por isenção */
  is_exempted?: boolean;
  /** Filtrar por data inicial */
  start_date?: Date;
  /** Filtrar por data final */
  end_date?: Date;
}

/**
 * Interface para resultado da listagem de assinaturas
 */
export interface SubscriptionListResult extends PaginatedResult<Subscription> {
  /** Renomear items para subscriptions para manter retrocompatibilidade */
  items: never;
  /** Lista de assinaturas */
  subscriptions: Subscription[];
}
