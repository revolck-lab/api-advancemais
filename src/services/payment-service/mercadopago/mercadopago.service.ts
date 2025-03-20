import mercadopago from 'mercadopago';
import { getMercadoPagoInstance } from '@shared/config/mercadopago';
import { 
  ICreatePaymentDTO, 
  IPaymentResult, 
  PaymentStatus,
  PaymentType
} from '../interfaces/payment.interface';
import {
  ICreateSubscriptionDTO,
  ISubscriptionResult,
  SubscriptionStatus
} from '../interfaces/subscription.interface';

/**
 * Classe de serviço para integração com o Mercado Pago
 * Implementa operações de pagamentos e assinaturas
 */
export class MercadoPagoService {
  private mp: typeof mercadopago;

  /**
   * Inicializa o serviço com a instância configurada do Mercado Pago
   */
  constructor() {
    this.mp = getMercadoPagoInstance();
  }

  /**
   * Cria um pagamento único no Mercado Pago
   * @param data Dados do pagamento a ser criado
   * @returns Resultado da operação de pagamento
   */
  public async createPayment(data: ICreatePaymentDTO): Promise<IPaymentResult> {
    try {
      // Prepare data for Mercado Pago API
      const paymentData = {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: data.payment_method,
        installments: data.installments || 1,
        payer: data.payer,
        metadata: {
          user_id: data.user_id,
          ...data.metadata
        },
        statement_descriptor: data.statement_descriptor || 'AdvanceMais',
        notification_url: process.env.MERCADOPAGO_NOTIFICATION_URL,
        callback_url: process.env.MERCADOPAGO_SUCCESS_URL,
        additional_info: {
          items: [
            {
              id: '1',
              title: data.description,
              description: data.description,
              quantity: 1,
              unit_price: data.amount
            }
          ]
        }
      };

      // Se for pagamento com cartão, adicionar o token
      if (data.payment_type === PaymentType.CREDIT_CARD || data.payment_type === PaymentType.DEBIT_CARD) {
        if (!data.card?.token) {
          throw new Error('Token de cartão é obrigatório para pagamentos com cartão');
        }
        
        // @ts-ignore - O tipo da API do MP é diferente do nosso
        paymentData.token = data.card.token;
      }

      // Se for PIX, definir o payment_method_id
      if (data.payment_type === PaymentType.PIX) {
        paymentData.payment_method_id = 'pix';
      }

      // Criar o pagamento no Mercado Pago
      const response = await this.mp.payment.create(paymentData);
      
      if (!response || !response.body) {
        throw new Error('Resposta inválida do Mercado Pago');
      }

      // Formatar o resultado
      const result: IPaymentResult = {
        id: String(response.body.id),
        external_id: String(response.body.id),
        status: this.mapMercadoPagoStatus(response.body.status),
        status_detail: response.body.status_detail,
        payment_method_id: response.body.payment_method_id,
        payment_type_id: response.body.payment_type_id,
        transaction_amount: response.body.transaction_amount,
        installments: response.body.installments,
        processing_mode: response.body.processing_mode,
        description: response.body.description,
        payer: response.body.payer,
        metadata: response.body.metadata,
        transaction_details: response.body.transaction_details,
        fee_details: response.body.fee_details,
        charges_details: response.body.charges_details,
        point_of_interaction: response.body.point_of_interaction
      };

      return result;
    } catch (error) {
      console.error('❌ Erro ao criar pagamento no Mercado Pago:', error);
      throw error;
    }
  }

  /**
   * Consulta um pagamento pelo ID no Mercado Pago
   * @param id ID do pagamento no Mercado Pago
   * @returns Dados do pagamento
   */
  public async getPayment(id: string): Promise<IPaymentResult> {
    try {
      const response = await this.mp.payment.get(Number(id));
      
      if (!response || !response.body) {
        throw new Error(`Pagamento com ID ${id} não encontrado`);
      }

      // Formatar o resultado
      const result: IPaymentResult = {
        id: String(response.body.id),
        external_id: String(response.body.id),
        status: this.mapMercadoPagoStatus(response.body.status),
        status_detail: response.body.status_detail,
        payment_method_id: response.body.payment_method_id,
        payment_type_id: response.body.payment_type_id,
        transaction_amount: response.body.transaction_amount,
        installments: response.body.installments,
        processing_mode: response.body.processing_mode,
        description: response.body.description,
        payer: response.body.payer,
        metadata: response.body.metadata,
        transaction_details: response.body.transaction_details,
        fee_details: response.body.fee_details,
        charges_details: response.body.charges_details,
        point_of_interaction: response.body.point_of_interaction
      };

      return result;
    } catch (error) {
      console.error(`❌ Erro ao consultar pagamento ${id} no Mercado Pago:`, error);
      throw error;
    }
  }

  /**
   * Cancela um pagamento pendente no Mercado Pago
   * @param id ID do pagamento no Mercado Pago
   * @returns Resultado da operação
   */
  public async cancelPayment(id: string): Promise<IPaymentResult> {
    try {
      const response = await this.mp.payment.cancel(Number(id));
      
      if (!response || !response.body) {
        throw new Error(`Erro ao cancelar pagamento ${id}`);
      }

      // Formatar o resultado
      const result: IPaymentResult = {
        id: String(response.body.id),
        external_id: String(response.body.id),
        status: this.mapMercadoPagoStatus(response.body.status),
        status_detail: response.body.status_detail,
        payment_method_id: response.body.payment_method_id,
        payment_type_id: response.body.payment_type_id,
        transaction_amount: response.body.transaction_amount,
        installments: response.body.installments,
        processing_mode: response.body.processing_mode,
        description: response.body.description,
        payer: response.body.payer,
        metadata: response.body.metadata
      };

      return result;
    } catch (error) {
      console.error(`❌ Erro ao cancelar pagamento ${id} no Mercado Pago:`, error);
      throw error;
    }
  }

  /**
   * Reembolsa um pagamento aprovado no Mercado Pago
   * @param id ID do pagamento no Mercado Pago
   * @returns Resultado da operação
   */
  public async refundPayment(id: string): Promise<IPaymentResult> {
    try {
      const response = await this.mp.refund.create({ payment_id: Number(id) });
      
      if (!response || !response.body) {
        throw new Error(`Erro ao reembolsar pagamento ${id}`);
      }

      // Consultar o pagamento para obter os dados atualizados
      const paymentResponse = await this.mp.payment.get(Number(id));

      // Formatar o resultado
      const result: IPaymentResult = {
        id: String(paymentResponse.body.id),
        external_id: String(paymentResponse.body.id),
        status: this.mapMercadoPagoStatus(paymentResponse.body.status),
        status_detail: paymentResponse.body.status_detail,
        payment_method_id: paymentResponse.body.payment_method_id,
        payment_type_id: paymentResponse.body.payment_type_id,
        transaction_amount: paymentResponse.body.transaction_amount,
        installments: paymentResponse.body.installments,
        processing_mode: paymentResponse.body.processing_mode,
        description: paymentResponse.body.description,
        payer: paymentResponse.body.payer,
        metadata: paymentResponse.body.metadata
      };

      return result;
    } catch (error) {
      console.error(`❌ Erro ao reembolsar pagamento ${id} no Mercado Pago:`, error);
      throw error;
    }
  }

  /**
   * Cria uma assinatura no Mercado Pago
   * @param data Dados da assinatura a ser criada
   * @returns Resultado da operação de assinatura
   */
  public async createSubscription(data: ICreateSubscriptionDTO): Promise<ISubscriptionResult> {
    try {
      // Verificar se o plano existe
      const planExists = await this.checkPlanExists(data.plan_id);
      if (!planExists) {
        throw new Error(`Plano com ID ${data.plan_id} não encontrado`);
      }

      // Preparar dados para a API do Mercado Pago
      const subscriptionData = {
        preapproval_plan_id: data.plan_id,
        card_token_id: data.card_token,
        payer_email: data.payer.email,
        auto_recurring: {
          frequency: data.frequency,
          frequency_type: data.frequency_type.toLowerCase(),
          transaction_amount: 0, // Será definido pelo plano
          start_date: data.start_date ? new Date(data.start_date).toISOString() : new Date().toISOString(),
          end_date: data.end_date ? new Date(data.end_date).toISOString() : undefined
        },
        reason: `Assinatura do plano ${data.plan_id}`,
        external_reference: `user_${data.user_id}`,
        metadata: {
          user_id: data.user_id,
          ...data.metadata
        },
        back_url: process.env.MERCADOPAGO_SUCCESS_URL,
        status: "authorized"
      };

      // Criar a assinatura no Mercado Pago
      const response = await this.mp.preapproval.create(subscriptionData);
      
      if (!response || !response.body) {
        throw new Error('Resposta inválida do Mercado Pago');
      }

      // Formatar o resultado
      const result: ISubscriptionResult = {
        id: String(response.body.id),
        external_id: String(response.body.id),
        status: this.mapMercadoPagoSubscriptionStatus(response.body.status),
        plan_id: response.body.preapproval_plan_id,
        payer_id: response.body.payer_id,
        card_id: response.body.card_id,
        next_payment_date: response.body.next_payment_date,
        start_date: response.body.date_created,
        end_date: response.body.end_date,
        payment_method_id: data.payment_method_id,
        auto_recurring: response.body.auto_recurring?.frequency_type ? true : false,
        metadata: response.body.metadata
      };

      return result;
    } catch (error) {
      console.error('❌ Erro ao criar assinatura no Mercado Pago:', error);
      throw error;
    }
  }

  /**
   * Consulta uma assinatura pelo ID no Mercado Pago
   * @param id ID da assinatura no Mercado Pago
   * @returns Dados da assinatura
   */
  public async getSubscription(id: string): Promise<ISubscriptionResult> {
    try {
      const response = await this.mp.preapproval.get(id);
      
      if (!response || !response.body) {
        throw new Error(`Assinatura com ID ${id} não encontrada`);
      }

      // Formatar o resultado
      const result: ISubscriptionResult = {
        id: String(response.body.id),
        external_id: String(response.body.id),
        status: this.mapMercadoPagoSubscriptionStatus(response.body.status),
        plan_id: response.body.preapproval_plan_id,
        payer_id: response.body.payer_id,
        card_id: response.body.card_id,
        next_payment_date: response.body.next_payment_date,
        start_date: response.body.date_created,
        end_date: response.body.end_date,
        payment_method_id: response.body.payment_method_id || 'credit_card',
        auto_recurring: response.body.auto_recurring?.frequency_type ? true : false,
        metadata: response.body.metadata
      };

      return result;
    } catch (error) {
      console.error(`❌ Erro ao consultar assinatura ${id} no Mercado Pago:`, error);
      throw error;
    }
  }

  /**
   * Cancela uma assinatura ativa no Mercado Pago
   * @param id ID da assinatura no Mercado Pago
   * @returns Resultado da operação
   */
  public async cancelSubscription(id: string): Promise<ISubscriptionResult> {
    try {
      const response = await this.mp.preapproval.update({
        id: id,
        status: "cancelled"
      });
      
      if (!response || !response.body) {
        throw new Error(`Erro ao cancelar assinatura ${id}`);
      }

      // Formatar o resultado
      const result: ISubscriptionResult = {
        id: String(response.body.id),
        external_id: String(response.body.id),
        status: this.mapMercadoPagoSubscriptionStatus(response.body.status),
        plan_id: response.body.preapproval_plan_id,
        payer_id: response.body.payer_id,
        card_id: response.body.card_id,
        next_payment_date: response.body.next_payment_date,
        start_date: response.body.date_created,
        end_date: response.body.end_date,
        payment_method_id: response.body.payment_method_id || 'credit_card',
        auto_recurring: response.body.auto_recurring?.frequency_type ? true : false,
        metadata: response.body.metadata
      };

      return result;
    } catch (error) {
      console.error(`❌ Erro ao cancelar assinatura ${id} no Mercado Pago:`, error);
      throw error;
    }
  }

  /**
   * Pausa uma assinatura ativa no Mercado Pago
   * @param id ID da assinatura no Mercado Pago
   * @returns Resultado da operação
   */
  public async pauseSubscription(id: string): Promise<ISubscriptionResult> {
    try {
      const response = await this.mp.preapproval.update({
        id: id,
        status: "paused"
      });
      
      if (!response || !response.body) {
        throw new Error(`Erro ao pausar assinatura ${id}`);
      }

      // Formatar o resultado
      const result: ISubscriptionResult = {
        id: String(response.body.id),
        external_id: String(response.body.id),
        status: this.mapMercadoPagoSubscriptionStatus(response.body.status),
        plan_id: response.body.preapproval_plan_id,
        payer_id: response.body.payer_id,
        card_id: response.body.card_id,
        next_payment_date: response.body.next_payment_date,
        start_date: response.body.date_created,
        end_date: response.body.end_date,
        payment_method_id: response.body.payment_method_id || 'credit_card',
        auto_recurring: response.body.auto_recurring?.frequency_type ? true : false,
        metadata: response.body.metadata