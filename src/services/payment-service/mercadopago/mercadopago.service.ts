import { MercadoPagoConfig } from 'mercadopago';
import { 
  ICreatePaymentDTO, 
  IPaymentResult
} from '../interfaces/payment.interface';
import {
  ICreateSubscriptionDTO,
  ISubscriptionResult
} from '../interfaces/subscription.interface';
import { PaymentHandler } from './payment.handler';
import { SubscriptionHandler } from './subscription.handler';
import { StatusMapper } from './status.mapper';

/**
 * Classe principal para integração com o Mercado Pago
 * Delega operações específicas para handlers especializados
 * Adaptada para a versão 2.3.0 do SDK do Mercado Pago
 */
export class MercadoPagoService {
  private client: MercadoPagoConfig;
  private paymentHandler: PaymentHandler;
  private subscriptionHandler: SubscriptionHandler;
  private statusMapper: StatusMapper;

  /**
   * Inicializa o serviço com a instância configurada do Mercado Pago
   */
  constructor() {
    // Obter access token do ambiente
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente');
    }
    
    // Configurar o cliente do Mercado Pago com a versão 2.3.0
    this.client = new MercadoPagoConfig({
      accessToken: accessToken
    });
    
    this.statusMapper = new StatusMapper();
    this.paymentHandler = new PaymentHandler(this.client, this.statusMapper);
    this.subscriptionHandler = new SubscriptionHandler(this.client, this.statusMapper);
  }

  // ==================== MÉTODOS DE PAGAMENTO ====================

  /**
   * Cria um pagamento único no Mercado Pago
   * @param data Dados do pagamento a ser criado
   * @returns Resultado da operação de pagamento
   */
  public async createPayment(data: ICreatePaymentDTO): Promise<IPaymentResult> {
    return this.paymentHandler.createPayment(data);
  }

  /**
   * Consulta um pagamento pelo ID no Mercado Pago
   * @param id ID do pagamento no Mercado Pago
   * @returns Dados do pagamento
   */
  public async getPayment(id: string): Promise<IPaymentResult> {
    return this.paymentHandler.getPayment(id);
  }

  /**
   * Cancela um pagamento pendente no Mercado Pago
   * @param id ID do pagamento no Mercado Pago
   * @returns Resultado da operação
   */
  public async cancelPayment(id: string): Promise<IPaymentResult> {
    return this.paymentHandler.cancelPayment(id);
  }

  /**
   * Reembolsa um pagamento aprovado no Mercado Pago
   * @param id ID do pagamento no Mercado Pago
   * @returns Resultado da operação
   */
  public async refundPayment(id: string): Promise<IPaymentResult> {
    return this.paymentHandler.refundPayment(id);
  }

  // ==================== MÉTODOS DE ASSINATURA ====================

  /**
   * Verifica se um plano de assinatura existe no Mercado Pago
   * @param planId ID do plano de assinatura
   * @returns true se o plano existir
   */
  public async checkPlanExists(planId: string): Promise<boolean> {
    return this.subscriptionHandler.checkPlanExists(planId);
  }

  /**
   * Cria uma assinatura no Mercado Pago
   * @param data Dados da assinatura a ser criada
   * @returns Resultado da operação de assinatura
   */
  public async createSubscription(data: ICreateSubscriptionDTO): Promise<ISubscriptionResult> {
    return this.subscriptionHandler.createSubscription(data);
  }

  /**
   * Consulta uma assinatura pelo ID no Mercado Pago
   * @param id ID da assinatura no Mercado Pago
   * @returns Dados da assinatura
   */
  public async getSubscription(id: string): Promise<ISubscriptionResult> {
    return this.subscriptionHandler.getSubscription(id);
  }

  /**
   * Cancela uma assinatura ativa no Mercado Pago
   * @param id ID da assinatura no Mercado Pago
   * @returns Resultado da operação
   */
  public async cancelSubscription(id: string): Promise<ISubscriptionResult> {
    return this.subscriptionHandler.cancelSubscription(id);
  }

  /**
   * Pausa uma assinatura ativa no Mercado Pago
   * @param id ID da assinatura no Mercado Pago
   * @returns Resultado da operação
   */
  public async pauseSubscription(id: string): Promise<ISubscriptionResult> {
    return this.subscriptionHandler.pauseSubscription(id);
  }

  /**
   * Reativa uma assinatura pausada no Mercado Pago
   * @param id ID da assinatura no Mercado Pago
   * @returns Resultado da operação
   */
  public async reactivateSubscription(id: string): Promise<ISubscriptionResult> {
    return this.subscriptionHandler.reactivateSubscription(id);
  }
}