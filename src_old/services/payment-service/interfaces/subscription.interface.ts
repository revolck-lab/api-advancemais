/**
 * Interface que define as propriedades de uma assinatura
 */
export interface ISubscription {
    id?: string;
    external_id?: string;
    user_id: number;
    plan_id: string;
    status: SubscriptionStatus;
    start_date: Date;
    end_date?: Date;
    next_payment_date?: Date;
    payment_method_id: string;
    frequency: SubscriptionFrequency;
    frequency_type: FrequencyType;
    auto_recurring: boolean;
    created_at?: Date;
    updated_at?: Date;
    metadata?: Record<string, any>;
  }
  
  /**
   * Status possíveis para uma assinatura
   */
  export enum SubscriptionStatus {
    PENDING = 'pending',
    AUTHORIZED = 'authorized',
    ACTIVE = 'active',
    PAUSED = 'paused',
    CANCELLED = 'cancelled',
    ENDED = 'ended',
    PAYMENT_FAILED = 'payment_failed'
  }
  
  /**
   * Frequência de pagamento da assinatura
   */
  export enum SubscriptionFrequency {
    MONTHLY = 'monthly',
    BIMONTHLY = 'bimonthly',
    QUARTERLY = 'quarterly',
    BIANNUAL = 'biannual',
    ANNUAL = 'annual'
  }
  
  /**
   * Tipo de frequência (dias, meses, anos)
   */
  export enum FrequencyType {
    DAYS = 'days',
    MONTHS = 'months',
    YEARS = 'years'
  }
  
  /**
   * Interface para criação de uma nova assinatura
   */
  export interface ICreateSubscriptionDTO {
    user_id: number;
    plan_id: string;
    payment_method_id: string;
    auto_recurring: boolean;
    frequency: number;
    frequency_type: FrequencyType;
    start_date?: Date;
    end_date?: Date;
    card_token?: string;
    payer: {
      email: string;
      identification?: {
        type: string;
        number: string;
      };
    };
    metadata?: Record<string, any>;
  }
  
  /**
   * Interface para o resultado da criação de uma assinatura
   */
  export interface ISubscriptionResult {
    id: string;
    external_id: string;
    status: SubscriptionStatus;
    plan_id: string;
    payer_id: string;
    card_id: string;
    next_payment_date: string;
    start_date: string;
    end_date?: string;
    payment_method_id: string;
    auto_recurring: boolean;
    charges_detail?: Array<{
      id: string;
      status: string;
      amount: number;
      last_modified: string;
    }>;
    metadata?: Record<string, any>;
  }
  
  /**
   * Interface para filtrar assinaturas na listagem
   */
  export interface ISubscriptionFilters {
    user_id?: number;
    status?: SubscriptionStatus;
    plan_id?: string;
    start_date?: Date;
    end_date?: Date;
    page?: number;
    limit?: number;
  }
  
  /**
   * Interface para planos de assinatura
   */
  export interface ISubscriptionPlan {
    id: string;
    name: string;
    description: string;
    amount: number;
    currency_id: string;
    payment_type_id: string;
    frequency: number;
    frequency_type: FrequencyType;
    status: string;
    auto_recurring: boolean;
    created_at?: Date;
    updated_at?: Date;
  }