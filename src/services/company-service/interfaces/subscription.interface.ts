// src/services/company-service/interfaces/subscription.interface.ts

/**
 * Interface para dados de criação de assinatura de empresa
 */
export interface CreateCompanySubscriptionDTO {
  company_id: number;
  plan_id: string;
  payment_method_id: string;
  auto_recurring: boolean;
  external_id?: string;
  is_exempted?: boolean;
  exemption_reason?: string;
  exempted_by?: number;
}

/**
 * Interface para atualização de assinatura de empresa
 */
export interface UpdateSubscriptionDTO {
  status?: string;
  end_date?: Date;
  next_payment_date?: Date;
  is_exempted?: boolean;
  exemption_reason?: string;
  exempted_by?: number;
}

/**
 * Interface para cancelamento de assinatura
 */
export interface CancelSubscriptionDTO {
  cancellation_reason?: string;
  canceled_by?: number;
}

/**
 * Interface para filtros de listagem de assinaturas
 */
export interface SubscriptionFilters {
  company_id?: number;
  status?: string;
  plan_id?: string;
  is_exempted?: boolean;
  start_date?: Date;
  end_date?: Date;
  page?: number;
  limit?: number;
}

/**
 * Interface para resultado da listagem de assinaturas
 */
export interface SubscriptionListResult {
  subscriptions: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
