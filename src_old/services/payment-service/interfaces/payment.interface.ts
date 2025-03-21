/**
 * Interface que define as propriedades de um pagamento
 */
export interface IPayment {
    id?: string;
    external_id?: string;
    user_id: number;
    amount: number;
    currency: string;
    description: string;
    status: PaymentStatus;
    payment_method: string;
    payment_type: PaymentType;
    created_at?: Date;
    updated_at?: Date;
    metadata?: Record<string, any>;
  }
  
  /**
   * Status possíveis para um pagamento
   */
  export enum PaymentStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    AUTHORIZED = 'authorized',
    IN_PROCESS = 'in_process',
    IN_MEDIATION = 'in_mediation',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded',
    CHARGED_BACK = 'charged_back'
  }
  
  /**
   * Tipos de pagamento suportados
   */
  export enum PaymentType {
    CREDIT_CARD = 'credit_card',
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    PIX = 'pix',
    BOLETO = 'boleto',
    WALLET = 'wallet',
    SUBSCRIPTION = 'subscription'
  }
  
  /**
   * Interface para criação de um novo pagamento
   */
  export interface ICreatePaymentDTO {
    user_id: number;
    amount: number;
    currency: string;
    description: string;
    payment_method: string;
    payment_type: PaymentType;
    installments?: number;
    statement_descriptor?: string;
    metadata?: Record<string, any>;
    payer?: {
      email: string;
      identification?: {
        type: string;
        number: string;
      };
    };
    card?: {
      token: string;
    };
  }
  
  /**
   * Interface para o resultado da criação de um pagamento
   */
  export interface IPaymentResult {
    id: string;
    status: PaymentStatus;
    status_detail: string;
    external_id: string;
    payment_method_id: string;
    payment_type_id: string;
    transaction_amount: number;
    installments: number;
    processing_mode: string;
    description: string;
    payer: {
      id?: string;
      email: string;
      identification?: {
        type: string;
        number: string;
      };
    };
    metadata?: Record<string, any>;
    transaction_details?: {
      net_received_amount: number;
      total_paid_amount: number;
      installment_amount: number;
    };
    fee_details?: Array<{
      type: string;
      amount: number;
    }>;
    charges_details?: Array<any>;
    payment_method?: {
      id: string;
      type: string;
    };
    point_of_interaction?: {
      type: string;
      application_data?: {
        name: string;
        version: string;
      };
      transaction_data?: {
        qr_code: string;
        qr_code_base64: string;
        ticket_url: string;
      };
    };
  }
  
  /**
   * Interface para filtrar pagamentos na listagem
   */
  export interface IPaymentFilters {
    user_id?: number;
    status?: PaymentStatus;
    payment_type?: PaymentType;
    start_date?: Date;
    end_date?: Date;
    page?: number;
    limit?: number;
  }