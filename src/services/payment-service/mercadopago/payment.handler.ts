import mercadopago from 'mercadopago';
import { 
  ICreatePaymentDTO, 
  IPaymentResult, 
  PaymentType 
} from '../interfaces/payment.interface';
import { StatusMapper } from './status.mapper';

/**
 * Handler especializado em operações de pagamento com o Mercado Pago
 */
export class PaymentHandler {
  constructor(
    private mp: typeof mercadopago,
    private statusMapper: StatusMapper
  ) {}

  /**
   * Cria um pagamento único no Mercado Pago
   * @param data Dados do pagamento a ser criado
   * @returns Resultado da operação de pagamento
   */
  public async createPayment(data: ICreatePaymentDTO): Promise<IPaymentResult> {
    try {
      // Prepare data for Mercado Pago API
      const paymentData = this.preparePaymentData(data);

      // Criar o pagamento no Mercado Pago
      const response = await this.mp.payment.create(paymentData);
      
      if (!response || !response.body) {
        throw new Error('Resposta inválida do Mercado Pago');
      }

      // Formatar o resultado
      return this.formatPaymentResponse(response.body);
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
      return this.formatPaymentResponse(response.body);
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
      return this.formatPaymentResponse(response.body);
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
      return this.formatPaymentResponse(paymentResponse.body);
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
      
      // @ts-ignore - O tipo da API do MP é diferente do nosso
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
  private formatPaymentResponse(responseBody: any): IPaymentResult {
    return {
      id: String(responseBody.id),
      external_id: String(responseBody.id),
      status: this.statusMapper.mapPaymentStatus(responseBody.status),
      status_detail: responseBody.status_detail,
      payment_method_id: responseBody.payment_method_id,
      payment_type_id: responseBody.payment_type_id,
      transaction_amount: responseBody.transaction_amount,
      installments: responseBody.installments,
      processing_mode: responseBody.processing_mode,
      description: responseBody.description,
      payer: responseBody.payer,
      metadata: responseBody.metadata,
      transaction_details: responseBody.transaction_details,
      fee_details: responseBody.fee_details,
      charges_details: responseBody.charges_details,
      point_of_interaction: responseBody.point_of_interaction
    };
  }
}