import { MercadoPagoConfig } from 'mercadopago';
import { 
  ICreatePaymentDTO, 
  IPaymentResult, 
  PaymentType 
} from '../interfaces/payment.interface';
import { StatusMapper } from './status.mapper';

/**
 * Handler especializado em operações de pagamento com o Mercado Pago
 * Adaptado para a versão 2.3.0 do SDK do Mercado Pago
 */
export class PaymentHandler {
  /**
   * Inicializa o handler com a configuração do Mercado Pago
   * @param client Instância configurada do cliente MercadoPago
   * @param statusMapper Mapeador de status do Mercado Pago para formatos internos
   */
  constructor(
    private client: MercadoPagoConfig,
    private statusMapper: StatusMapper
  ) {}
  
  // URL base da API do Mercado Pago
  private get apiBaseUrl(): string {
    return 'https://api.mercadopago.com';
  }

  /**
   * Cria um pagamento único no Mercado Pago
   * @param data Dados do pagamento a ser criado
   * @returns Resultado da operação de pagamento
   */
  public async createPayment(data: ICreatePaymentDTO): Promise<IPaymentResult> {
    try {
      // Prepare data for Mercado Pago API
      const paymentData = this.preparePaymentData(data);

      // Criar o pagamento no Mercado Pago usando a nova API
      const response = await fetch(`${this.apiBaseUrl}/v1/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao criar pagamento: ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json() as Record<string, any>;
      
      if (!responseData || typeof responseData !== 'object' || !('id' in responseData)) {
        throw new Error('Resposta inválida do Mercado Pago: ID não encontrado');
      }

      // Formatar o resultado
      return this.formatPaymentResponse(responseData as Record<string, any>);
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
      const response = await fetch(`${this.apiBaseUrl}/v1/payments/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao consultar pagamento: ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      
      if (!responseData || typeof responseData !== 'object' || !('id' in responseData)) {
        throw new Error(`Pagamento com ID ${id} não encontrado ou formato de resposta inválido`);
      }

      // Formatar o resultado
      return this.formatPaymentResponse(responseData);
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
      const response = await fetch(`${this.apiBaseUrl}/v1/payments/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro ao cancelar pagamento: ${JSON.stringify(errorData)}`);
      }

      const responseData = await response.json();
      
      if (!responseData || typeof responseData !== 'object' || !('id' in responseData)) {
        throw new Error(`Erro ao cancelar pagamento ${id}: formato de resposta inválido`);
      }

      // Formatar o resultado
      return this.formatPaymentResponse(responseData);
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
      // Criar o reembolso utilizando a API REST direta
      const refundResponse = await fetch(`${this.apiBaseUrl}/v1/payments/${id}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!refundResponse.ok) {
        const errorData = await refundResponse.json();
        throw new Error(`Erro ao reembolsar pagamento: ${JSON.stringify(errorData)}`);
      }

      // Consultar o pagamento para obter os dados atualizados
      const paymentResponse = await fetch(`${this.apiBaseUrl}/v1/payments/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`
        }
      });

      if (!paymentResponse.ok) {
        throw new Error(`Erro ao obter detalhes do pagamento após reembolso`);
      }

      const paymentData = await paymentResponse.json() as Record<string, any>;

      // Formatar o resultado
      return this.formatPaymentResponse(paymentData);
    } catch (error) {
      console.error(`❌ Erro ao reembolsar pagamento ${id} no Mercado Pago:`, error);
      throw error;
    }
  }

  /**
   * Prepara os dados para envio ao Mercado Pago
   * @param data Dados do pagamento
   * @returns Objeto formatado para a API do Mercado Pago
   */
  private preparePaymentData(data: ICreatePaymentDTO): any {
    const paymentData: any = {
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
      
      paymentData.token = data.card.token;
    }

    // Se for PIX, definir o payment_method_id
    if (data.payment_type === PaymentType.PIX) {
      paymentData.payment_method_id = 'pix';
    }

    return paymentData;
  }

  /**
   * Formata a resposta da API do Mercado Pago para o formato interno
   * @param responseBody Resposta da API do Mercado Pago
   * @returns Objeto formatado no formato interno
   */
  private formatPaymentResponse(responseBody: Record<string, any>): IPaymentResult {
    // Garantir que o responseBody tem as propriedades necessárias
    const id = responseBody.id?.toString() || '';
    
    return {
      id: id,
      external_id: id,
      status: this.statusMapper.mapPaymentStatus(responseBody.status || ''),
      status_detail: responseBody.status_detail || '',
      payment_method_id: responseBody.payment_method_id || '',
      payment_type_id: responseBody.payment_type_id || '',
      transaction_amount: responseBody.transaction_amount || 0,
      installments: responseBody.installments || 1,
      processing_mode: responseBody.processing_mode || '',
      description: responseBody.description || '',
      payer: responseBody.payer || {},
      metadata: responseBody.metadata || {},
      transaction_details: responseBody.transaction_details || {},
      fee_details: responseBody.fee_details || [],
      charges_details: responseBody.charges_details || [],
      point_of_interaction: responseBody.point_of_interaction || {}
    };
  }
}