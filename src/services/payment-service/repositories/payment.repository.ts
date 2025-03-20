import { PrismaClient } from '@prisma/client';
import { 
  IPayment, 
  ICreatePaymentDTO, 
  IPaymentFilters,
  PaymentStatus,
  PaymentType
} from '../interfaces/payment.interface';

/**
 * Repositório para operações de pagamentos no banco de dados
 */
export class PaymentRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Cria um novo registro de pagamento no banco de dados
   * @param data Dados do pagamento a ser criado
   * @returns Registro de pagamento criado
   */
  public async create(data: IPayment): Promise<IPayment> {
    return this.prisma.payment.create({
      data: {
        user_id: data.user_id,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        status: data.status,
        payment_method: data.payment_method,
        payment_type: data.payment_type,
        external_id: data.external_id,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });
  }

  /**
   * Atualiza um registro de pagamento no banco de dados
   * @param id ID do pagamento
   * @param data Dados a serem atualizados
   * @returns Registro de pagamento atualizado
   */
  public async update(id: string, data: Partial<IPayment>): Promise<IPayment> {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: data.status,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        updated_at: new Date()
      }
    });
  }

  /**
   * Atualiza um registro de pagamento pelo ID externo
   * @param externalId ID externo do pagamento (Mercado Pago)
   * @param data Dados a serem atualizados
   * @returns Registro de pagamento atualizado
   */
  public async updateByExternalId(externalId: string, data: Partial<IPayment>): Promise<IPayment> {
    return this.prisma.payment.update({
      where: { external_id: externalId },
      data: {
        status: data.status,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        updated_at: new Date()
      }
    });
  }

  /**
   * Busca um pagamento pelo ID
   * @param id ID do pagamento
   * @returns Registro de pagamento ou null se não encontrado
   */
  public async findById(id: string): Promise<IPayment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { id }
    });

    if (!payment) return null;

    return {
      ...payment,
      metadata: payment.metadata ? JSON.parse(payment.metadata as string) : undefined
    };
  }

  /**
   * Busca um pagamento pelo ID externo (Mercado Pago)
   * @param externalId ID externo do pagamento
   * @returns Registro de pagamento ou null se não encontrado
   */
  public async findByExternalId(externalId: string): Promise<IPayment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { external_id: externalId }
    });

    if (!payment) return null;

    return {
      ...payment,
      metadata: payment.metadata ? JSON.parse(payment.metadata as string) : undefined
    };
  }

  /**
   * Lista pagamentos com filtros
   * @param filters Filtros para a listagem
   * @returns Lista de pagamentos e contagem total
   */
  public async findAll(filters: IPaymentFilters): Promise<{ payments: IPayment[], total: number }> {
    const { 
      user_id, 
      status, 
      payment_type, 
      start_date, 
      end_date,
      page = 1, 
      limit = 10 
    } = filters;

    const where: any = {};

    if (user_id) {
      where.user_id = user_id;
    }

    if (status) {
      where.status = status;
    }

    if (payment_type) {
      where.payment_type = payment_type;
    }

    if (start_date || end_date) {
      where.created_at = {};

      if (start_date) {
        where.created_at.gte = start_date;
      }

      if (end_date) {
        where.created_at.lte = end_date;
      }
    }

    const skip = (page - 1) * limit;

    // Definimos um tipo para o resultado do Prisma
    type PrismaPayment = {
      id: string;
      user_id: number;
      amount: number;
      currency: string;
      description: string;
      status: string;
      payment_method: string;
      payment_type: string;
      external_id: string | null;
      metadata: string | null;
      created_at: Date;
      updated_at: Date;
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.payment.count({ where })
    ]);

    // Parse metadata com tipagem explícita
    const formattedPayments = payments.map((payment: PrismaPayment) => ({
      ...payment,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : undefined
    }));

    return {
      payments: formattedPayments as IPayment[],
      total
    };
  }

  /**
   * Exclui um pagamento do banco de dados
   * @param id ID do pagamento
   * @returns true se excluído com sucesso
   */
  public async delete(id: string): Promise<boolean> {
    await this.prisma.payment.delete({
      where: { id }
    });
    return true;
  }
}