import { PrismaClient } from '@prisma/client';
import { 
  ISubscription, 
  ISubscriptionFilters,
  SubscriptionStatus,
  SubscriptionFrequency,
  FrequencyType
} from '../interfaces/subscription.interface';

/**
 * Repositório para operações de assinaturas no banco de dados
 */
export class SubscriptionRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Cria um novo registro de assinatura no banco de dados
   * @param data Dados da assinatura a ser criada
   * @returns Registro de assinatura criado
   */
  public async create(data: ISubscription): Promise<ISubscription> {
    return this.prisma.subscription.create({
      data: {
        user_id: data.user_id,
        plan_id: data.plan_id,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        next_payment_date: data.next_payment_date,
        payment_method_id: data.payment_method_id,
        frequency: data.frequency.toString(),
        frequency_type: data.frequency_type,
        auto_recurring: data.auto_recurring,
        external_id: data.external_id,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null
      }
    });
  }

  /**
   * Atualiza um registro de assinatura no banco de dados
   * @param id ID da assinatura
   * @param data Dados a serem atualizados
   * @returns Registro de assinatura atualizado
   */
  public async update(id: string, data: Partial<ISubscription>): Promise<ISubscription> {
    const updateData: any = {
      updated_at: new Date()
    };

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.end_date !== undefined) {
      updateData.end_date = data.end_date;
    }

    if (data.next_payment_date !== undefined) {
      updateData.next_payment_date = data.next_payment_date;
    }

    if (data.metadata !== undefined) {
      updateData.metadata = JSON.stringify(data.metadata);
    }

    return this.prisma.subscription.update({
      where: { id },
      data: updateData
    });
  }

  /**
   * Atualiza um registro de assinatura pelo ID externo
   * @param externalId ID externo da assinatura (Mercado Pago)
   * @param data Dados a serem atualizados
   * @returns Registro de assinatura atualizado
   */
  public async updateByExternalId(externalId: string, data: Partial<ISubscription>): Promise<ISubscription> {
    const updateData: any = {
      updated_at: new Date()
    };

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.end_date !== undefined) {
      updateData.end_date = data.end_date;
    }

    if (data.next_payment_date !== undefined) {
      updateData.next_payment_date = data.next_payment_date;
    }

    if (data.metadata !== undefined) {
      updateData.metadata = JSON.stringify(data.metadata);
    }

    return this.prisma.subscription.update({
      where: { external_id: externalId },
      data: updateData
    });
  }

  /**
   * Busca uma assinatura pelo ID
   * @param id ID da assinatura
   * @returns Registro de assinatura ou null se não encontrado
   */
  public async findById(id: string): Promise<ISubscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) return null;

    return {
      ...subscription,
      metadata: subscription.metadata ? JSON.parse(subscription.metadata as string) : undefined
    };
  }

  /**
   * Busca uma assinatura pelo ID externo (Mercado Pago)
   * @param externalId ID externo da assinatura
   * @returns Registro de assinatura ou null se não encontrado
   */
  public async findByExternalId(externalId: string): Promise<ISubscription | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { external_id: externalId }
    });

    if (!subscription) return null;

    return {
      ...subscription,
      metadata: subscription.metadata ? JSON.parse(subscription.metadata as string) : undefined
    };
  }

  /**
   * Busca a assinatura ativa de um usuário
   * @param userId ID do usuário
   * @returns Registro de assinatura ativa ou null se não encontrado
   */
  public async findActiveByUserId(userId: number): Promise<ISubscription | null> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { 
        user_id: userId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.AUTHORIZED, SubscriptionStatus.PENDING]
        }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!subscription) return null;

    return {
      ...subscription,
      metadata: subscription.metadata ? JSON.parse(subscription.metadata as string) : undefined
    };
  }

  /**
   * Lista assinaturas com filtros
   * @param filters Filtros para a listagem
   * @returns Lista de assinaturas e contagem total
   */
  public async findAll(filters: ISubscriptionFilters): Promise<{ subscriptions: ISubscription[], total: number }> {
    const { 
      user_id, 
      status, 
      plan_id,
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

    if (plan_id) {
      where.plan_id = plan_id;
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
    type PrismaSubscription = {
      id: string;
      user_id: number;
      plan_id: string;
      status: string;
      start_date: Date;
      end_date: Date | null;
      next_payment_date: Date | null;
      payment_method_id: string;
      frequency: string;
      frequency_type: string;
      auto_recurring: boolean;
      external_id: string | null;
      metadata: string | null;
      created_at: Date;
      updated_at: Date;
    };

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.subscription.count({ where })
    ]);

    // Parse metadata com tipagem explícita e mapeamento para enum
    const formattedSubscriptions = subscriptions.map((subscription: PrismaSubscription) => {
      // Mapear string para enum SubscriptionFrequency
      let frequencyEnum: SubscriptionFrequency;
      switch(subscription.frequency.toLowerCase()) {
        case 'monthly':
          frequencyEnum = SubscriptionFrequency.MONTHLY;
          break;
        case 'bimonthly':
          frequencyEnum = SubscriptionFrequency.BIMONTHLY;
          break;
        case 'quarterly':
          frequencyEnum = SubscriptionFrequency.QUARTERLY;
          break;
        case 'biannual':
          frequencyEnum = SubscriptionFrequency.BIANNUAL;
          break;
        case 'annual':
          frequencyEnum = SubscriptionFrequency.ANNUAL;
          break;
        default:
          frequencyEnum = SubscriptionFrequency.MONTHLY;
      }
      
      // Mapear string para enum FrequencyType
      let frequencyTypeEnum: FrequencyType;
      switch(subscription.frequency_type.toLowerCase()) {
        case 'days':
          frequencyTypeEnum = FrequencyType.DAYS;
          break;
        case 'months':
          frequencyTypeEnum = FrequencyType.MONTHS;
          break;
        case 'years':
          frequencyTypeEnum = FrequencyType.YEARS;
          break;
        default:
          frequencyTypeEnum = FrequencyType.MONTHS;
      }
      
      return {
        ...subscription,
        frequency: frequencyEnum,
        frequency_type: frequencyTypeEnum,
        metadata: subscription.metadata ? JSON.parse(subscription.metadata) : undefined
      };
    });

    return {
      subscriptions: formattedSubscriptions as ISubscription[],
      total
    };
  }

  /**
   * Exclui uma assinatura do banco de dados
   * @param id ID da assinatura
   * @returns true se excluído com sucesso
   */
  public async delete(id: string): Promise<boolean> {
    await this.prisma.subscription.delete({
      where: { id }
    });
    return true;
  }
}