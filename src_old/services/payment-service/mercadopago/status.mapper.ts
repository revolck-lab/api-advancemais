import { PaymentStatus } from '../interfaces/payment.interface';
import { SubscriptionStatus } from '../interfaces/subscription.interface';

/**
 * Classe responsável por mapear os status do Mercado Pago para os status internos
 */
export class StatusMapper {
  /**
   * Mapeia os status do Mercado Pago para os status internos da aplicação
   * @param mpStatus Status retornado pelo Mercado Pago
   * @returns Status mapeado para o formato interno
   */
  public mapPaymentStatus(mpStatus: string): PaymentStatus {
    const statusMap: { [key: string]: PaymentStatus } = {
      'pending': PaymentStatus.PENDING,
      'approved': PaymentStatus.APPROVED,
      'authorized': PaymentStatus.AUTHORIZED,
      'in_process': PaymentStatus.IN_PROCESS,
      'in_mediation': PaymentStatus.IN_MEDIATION,
      'rejected': PaymentStatus.REJECTED,
      'cancelled': PaymentStatus.CANCELLED,
      'refunded': PaymentStatus.REFUNDED,
      'charged_back': PaymentStatus.CHARGED_BACK
    };

    return statusMap[mpStatus] || PaymentStatus.PENDING;
  }

  /**
   * Mapeia os status de assinatura do Mercado Pago para os status internos
   * @param mpStatus Status de assinatura retornado pelo Mercado Pago
   * @returns Status mapeado para o formato interno
   */
  public mapSubscriptionStatus(mpStatus: string): SubscriptionStatus {
    const statusMap: { [key: string]: SubscriptionStatus } = {
      'pending': SubscriptionStatus.PENDING,
      'authorized': SubscriptionStatus.AUTHORIZED,
      'paused': SubscriptionStatus.PAUSED,
      'cancelled': SubscriptionStatus.CANCELLED,
      'ended': SubscriptionStatus.ENDED,
      'payment_failed': SubscriptionStatus.PAYMENT_FAILED
    };

    // Se o status for "authorized" e não for o processo inicial, 
    // consideramos como "active" para simplificar o fluxo
    if (mpStatus === 'authorized') {
      return SubscriptionStatus.ACTIVE;
    }

    return statusMap[mpStatus] || SubscriptionStatus.PENDING;
  }
}