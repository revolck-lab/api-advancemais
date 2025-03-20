import mercadopago from 'mercadopago';
import { 
  ICreateSubscriptionDTO, 
  ISubscriptionResult 
} from '../interfaces/subscription.interface';
import { StatusMapper } from './status.mapper';

/**
 * Handler especializado em operações de assinatura com o Mercado Pago
 */
export class SubscriptionHandler {
  constructor(
    private mp: typeof mercadopago,
    private statusMapper: StatusMapper
  ) {}

  /**
   * Verifica se um plano de assinatura existe no Mercado Pago
   * @param planId ID do plano de assinatura
   * @returns true se o plano existir
   */
  public async checkPlanExists(planId: string): Promise<boolean> {
    try {
      const response = await this.mp.preapproval_plan.get(planId);
      return !!response.body;
    } catch (error) {
      console.error(`❌ Erro ao verificar plano ${planId}:`, error);
      return false;
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
      const subscriptionData = this.prepareSubscriptionData(data);

      // Criar a assinatura no Mercado Pago
      const response = await this.mp.preapproval.create(subscriptionData);
      
      if (!response || !response.body) {
        throw new Error('Resposta inválida do Mercado Pago');
      }

      // Formatar o resultado
      return this.formatSubscriptionResponse(response.body, data.payment_method_id);
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
      return this.formatSubscriptionResponse(response.body);
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
      return this.formatSubscriptionResponse(response.body);
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
      return this.formatSubscriptionResponse(response.body);
    } catch (error) {
      console.error(`❌ Erro ao pausar assinatura ${id} no Mercado Pago:`, error);
      throw error;
    }
  }

  /**
   * Reativa uma assinatura pausada no Mercado Pago
   * @param id ID da assinatura no Mercado Pago
   * @returns Resultado da operação
   */
  public async reactivateSubscription(id: string): Promise<ISubscriptionResult> {
    try {
      const response = await this.mp.preapproval.update({
        id: id,
        status: "authorized"
      });
      
      if (!response || !response.body) {
        throw new Error(`Erro ao reativar assinatura ${id}`);
      }

      // Formatar o resultado
      return this.formatSubscriptionResponse(response.body);
    } catch (error) {
      console.error(`❌ Erro ao reativar assinatura ${id} no Mercado Pago:`, error);
      throw error;
    }
  }

  /**
   * Prepara os dados da assinatura para envio ao Mercado Pago
   * @param data Dados da assinatura
   * @returns Objeto formatado para a API do Mercado Pago
   */
  private prepareSubscriptionData(data: ICreateSubscriptionDTO): any {
    return {
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
  }

  /**
   * Formata a resposta da API do Mercado Pago para o formato interno
   * @param responseBody Resposta da API do Mercado Pago
   * @param paymentMethodId Método de pagamento, se não vier na resposta
   * @returns Objeto formatado no formato interno
   */
  private formatSubscriptionResponse(
    responseBody: any, 
    paymentMethodId?: string
  ): ISubscriptionResult {
    return {
      id: String(responseBody.id),
      external_id: String(responseBody.id),
      status: this.statusMapper.mapSubscriptionStatus(responseBody.status),
      plan_id: responseBody.preapproval_plan_id,
      payer_id: responseBody.payer_id,
      card_id: responseBody.card_id,
      next_payment_date: responseBody.next_payment_date,
      start_date: responseBody.date_created,
      end_date: responseBody.end_date,
      payment_method_id: responseBody.payment_method_id || paymentMethodId || 'credit_card',
      auto_recurring: responseBody.auto_recurring?.frequency_type ? true : false,
      metadata: responseBody.metadata
    };
  }
}