import { PrismaClient } from '@prisma/client';
import { 
  ICreatePaymentDTO, 
  IPayment, 
  IPaymentFilters, 
  IPaymentResult, 
  PaymentStatus 
} from './interfaces/payment.interface';
import { MercadoPagoService } from './mercadopago/mercadopago.service';
import { PaymentRepository } from './repositories/payment.repository';

/**
 * Serviço de pagamentos - centraliza a lógica de negócios relacionada a pagamentos
 */
export class PaymentService {
  private mercadoPagoService: MercadoPagoService;
  private paymentRepository: PaymentRepository;

  constructor(prisma: PrismaClient) {
    this.mercadoPagoService = new MercadoPagoService();
    this.paymentRepository = new PaymentRepository(prisma);
  }

  /**
   * Cria um novo pagamento
   * @param data Dados para criação do pagamento
   * @returns Pagamento criado com informações completas
   */
  public async createPayment(data: ICreatePaymentDTO): Promise<IPayment> {
    try {
      // 1. Criar o pagamento no Mercado Pago
      const mercadoPagoResult = await this.mercadoPagoService.createPayment(data);

      // 2. Salvar os dados do pagamento no banco de dados
      const paymentData: IPayment = {
        user_id: data.user_id,
        amount: mercadoPagoResult.transaction_amount,
        currency: data.currency || 'BRL',
        description: mercadoPagoResult.description,
        status: mercadoPagoResult.status,
        payment_method: mercadoPagoResult.payment_method_id,
        payment_type: data.payment_type,
        external_id: mercadoPagoResult.external_id,
        metadata: {
          ...mercadoPagoResult.metadata,
          payment_details: {
            installments: mercadoPagoResult.installments,
            processing_mode: mercadoPagoResult.processing_mode,
            transaction_details: mercadoPagoResult.transaction_details,
            point_of_interaction: mercadoPagoResult.point_of_interaction
          }
        }
      };

      const payment = await this.paymentRepository.create(paymentData);
      return payment;
    } catch (error) {
      console.error('❌ Erro ao criar pagamento:', error);
      throw error;
    }
  }

  /**
   * Consulta um pagamento pelo ID
   * @param id ID do pagamento
   * @returns Dados do pagamento
   */
  public async getPayment(id: string): Promise<IPayment> {
    const payment = await this.paymentRepository.findById(id);
    
    if (!payment) {
      throw new Error(`Pagamento com ID ${id} não encontrado`);
    }

    return payment;
  }

  /**
   * Consulta um pagamento pelo ID externo (Mercado Pago)
   * @param externalId ID externo do pagamento
   * @returns Dados do pagamento
   */
  public async getPaymentByExternalId(externalId: string): Promise<IPayment> {
    const payment = await this.paymentRepository.findByExternalId(externalId);
    
    if (!payment) {
      throw new Error(`Pagamento com ID externo ${externalId} não encontrado`);
    }

    return payment;
  }

  /**
   * Lista pagamentos com filtros
   * @param filters Filtros para a listagem
   * @returns Lista de pagamentos e contagem total
   */
  public async listPayments(filters: IPaymentFilters): Promise<{ payments: IPayment[], total: number }> {
    return this.paymentRepository.findAll(filters);
  }

  /**
   * Cancela um pagamento pendente
   * @param id ID do pagamento
   * @returns Pagamento atualizado
   */
  public async cancelPayment(id: string): Promise<IPayment> {
    // 1. Verificar se o pagamento existe
    const payment = await this.paymentRepository.findById(id);
    
    if (!payment) {
      throw new Error(`Pagamento com ID ${id} não encontrado`);
    }

    // 2. Verificar se o pagamento pode ser cancelado
    if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.IN_PROCESS) {
      throw new Error(`Pagamento com status '${payment.status}' não pode ser cancelado`);
    }

    // 3. Cancelar o pagamento no Mercado Pago
    await this.mercadoPagoService.cancelPayment(payment.external_id!);

    // 4. Atualizar o status no banco de dados
    const updatedPayment = await this.paymentRepository.update(id, {
      status: PaymentStatus.CANCELLED
    });

    return updatedPayment;
  }

  /**
   * Reembolsa um pagamento aprovado
   * @param id ID do pagamento
   * @returns Pagamento atualizado
   */
  public async refundPayment(id: string): Promise<IPayment> {
    // 1. Verificar se o pagamento existe
    const payment = await this.paymentRepository.findById(id);
    
    if (!payment) {
      throw new Error(`Pagamento com ID ${id} não encontrado`);
    }

    // 2. Verificar se o pagamento pode ser reembolsado
    if (payment.status !== PaymentStatus.APPROVED) {
      throw new Error(`Apenas pagamentos aprovados podem ser reembolsados`);
    }

    // 3. Reembolsar o pagamento no Mercado Pago
    await this.mercadoPagoService.refundPayment(payment.external_id!);

    // 4. Atualizar o status no banco de dados
    const updatedPayment = await this.paymentRepository.update(id, {
      status: PaymentStatus.REFUNDED
    });

    return updatedPayment;
  }

  /**
   * Atualiza o status de um pagamento com base em uma notificação
   * @param externalId ID externo do pagamento (Mercado Pago)
   * @returns Pagamento atualizado
   */
  public async updatePaymentStatus(externalId: string): Promise<IPayment> {
    try {
      // 1. Consultar o pagamento no Mercado Pago
      const mpPayment = await this.mercadoPagoService.getPayment(externalId);
      
      // 2. Verificar se o pagamento existe no banco de dados
      const payment = await this.paymentRepository.findByExternalId(externalId);
      
      if (!payment) {
        throw new Error(`Pagamento com ID externo ${externalId} não encontrado`);
      }

      // 3. Atualizar o status e metadados
      const updatedPayment = await this.paymentRepository.updateByExternalId(externalId, {
        status: mpPayment.status,
        metadata: {
          ...payment.metadata,
          last_update: new Date().toISOString(),
          status_detail: mpPayment.status_detail,
          transaction_details: mpPayment.transaction_details
        }
      });

      return updatedPayment;
    } catch (error) {
      console.error(`❌ Erro ao atualizar status do pagamento ${externalId}:`, error);
      throw error;
    }
  }

  /**
   * Processa uma notificação webhook do Mercado Pago
   * @param data Dados recebidos no webhook
   * @returns Resultado do processamento
   */
  public async processWebhook(data: any): Promise<{ success: boolean, message: string }> {
    try {
      if (!data.action || !data.data) {
        return { success: false, message: 'Dados de webhook inválidos' };
      }

      const action = data.action;
      const resourceId = data.data.id;

      if (action === 'payment.updated' || action === 'payment.created') {
        // Atualizar pagamento
        await this.updatePaymentStatus(resourceId);
        return { success: true, message: `Pagamento ${resourceId} atualizado com sucesso` };
      }

      return { success: true, message: `Ação ${action} recebida, mas não processada` };
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido ao processar webhook' 
      };
    }
  }
}