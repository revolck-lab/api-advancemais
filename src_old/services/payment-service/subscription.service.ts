import { PrismaClient } from '@prisma/client';
import { 
  ICreateSubscriptionDTO, 
  ISubscription, 
  ISubscriptionFilters, 
  ISubscriptionResult, 
  SubscriptionStatus,
  SubscriptionFrequency,
  FrequencyType
} from './interfaces/subscription.interface';
import { MercadoPagoService } from './mercadopago/mercadopago.service';
import { SubscriptionRepository } from './repositories/subscription.repository';

/**
 * Mapeia um valor de frequência numérica para o enum SubscriptionFrequency correspondente
 * @param frequency Valor numérico da frequência
 * @returns Valor do enum SubscriptionFrequency
 */
function mapFrequencyToEnum(frequency: number): SubscriptionFrequency {
  switch(frequency) {
    case 1:
      return SubscriptionFrequency.MONTHLY;
    case 2:
      return SubscriptionFrequency.BIMONTHLY;
    case 3:
      return SubscriptionFrequency.QUARTERLY;
    case 6:
      return SubscriptionFrequency.BIANNUAL;
    case 12:
      return SubscriptionFrequency.ANNUAL;
    default:
      return SubscriptionFrequency.MONTHLY; // Valor padrão se não corresponder
  }
}

/**
 * Serviço de assinaturas - centraliza a lógica de negócios relacionada a assinaturas
 */
export class SubscriptionService {
  private mercadoPagoService: MercadoPagoService;
  private subscriptionRepository: SubscriptionRepository;

  constructor(prisma: PrismaClient) {
    this.mercadoPagoService = new MercadoPagoService();
    this.subscriptionRepository = new SubscriptionRepository(prisma);
  }

  /**
   * Cria uma nova assinatura
   * @param data Dados para criação da assinatura
   * @returns Assinatura criada com informações completas
   */
  public async createSubscription(data: ICreateSubscriptionDTO): Promise<ISubscription> {
    try {
      // 1. Verificar se o usuário já possui uma assinatura ativa
      const existingSubscription = await this.subscriptionRepository.findActiveByUserId(data.user_id);
      
      if (existingSubscription) {
        throw new Error(`Usuário já possui uma assinatura ativa (ID: ${existingSubscription.id})`);
      }

      // 2. Criar a assinatura no Mercado Pago
      const mercadoPagoResult = await this.mercadoPagoService.createSubscription(data);

      // 3. Salvar os dados da assinatura no banco de dados
      const subscriptionData: ISubscription = {
        user_id: data.user_id,
        plan_id: data.plan_id,
        status: mercadoPagoResult.status,
        start_date: new Date(mercadoPagoResult.start_date),
        end_date: mercadoPagoResult.end_date ? new Date(mercadoPagoResult.end_date) : undefined,
        next_payment_date: mercadoPagoResult.next_payment_date ? new Date(mercadoPagoResult.next_payment_date) : undefined,
        payment_method_id: mercadoPagoResult.payment_method_id,
        frequency: mapFrequencyToEnum(data.frequency), // Convertendo número para enum
        frequency_type: data.frequency_type,
        auto_recurring: mercadoPagoResult.auto_recurring,
        external_id: mercadoPagoResult.external_id,
        metadata: {
          ...mercadoPagoResult.metadata,
          payer_id: mercadoPagoResult.payer_id,
          card_id: mercadoPagoResult.card_id
        }
      };

      const subscription = await this.subscriptionRepository.create(subscriptionData);
      return subscription;
    } catch (error) {
      console.error('❌ Erro ao criar assinatura:', error);
      throw error;
    }
  }

  /**
   * Consulta uma assinatura pelo ID
   * @param id ID da assinatura
   * @returns Dados da assinatura
   */
  public async getSubscription(id: string): Promise<ISubscription> {
    const subscription = await this.subscriptionRepository.findById(id);
    
    if (!subscription) {
      throw new Error(`Assinatura com ID ${id} não encontrada`);
    }

    return subscription;
  }

  /**
   * Consulta uma assinatura pelo ID externo (Mercado Pago)
   * @param externalId ID externo da assinatura
   * @returns Dados da assinatura
   */
  public async getSubscriptionByExternalId(externalId: string): Promise<ISubscription> {
    const subscription = await this.subscriptionRepository.findByExternalId(externalId);
    
    if (!subscription) {
      throw new Error(`Assinatura com ID externo ${externalId} não encontrada`);
    }

    return subscription;
  }

  /**
   * Consulta a assinatura ativa de um usuário
   * @param userId ID do usuário
   * @returns Dados da assinatura ativa ou null se não existir
   */
  public async getActiveSubscriptionByUserId(userId: number): Promise<ISubscription | null> {
    return this.subscriptionRepository.findActiveByUserId(userId);
  }

  /**
   * Lista assinaturas com filtros
   * @param filters Filtros para a listagem
   * @returns Lista de assinaturas e contagem total
   */
  public async listSubscriptions(filters: ISubscriptionFilters): Promise<{ subscriptions: ISubscription[], total: number }> {
    return this.subscriptionRepository.findAll(filters);
  }

  /**
   * Cancela uma assinatura ativa
   * @param id ID da assinatura
   * @returns Assinatura atualizada
   */
  public async cancelSubscription(id: string): Promise<ISubscription> {
    // 1. Verificar se a assinatura existe
    const subscription = await this.subscriptionRepository.findById(id);
    
    if (!subscription) {
      throw new Error(`Assinatura com ID ${id} não encontrada`);
    }

    // 2. Verificar se a assinatura pode ser cancelada
    if (
      subscription.status === SubscriptionStatus.CANCELLED || 
      subscription.status === SubscriptionStatus.ENDED
    ) {
      throw new Error(`Assinatura já está ${subscription.status}`);
    }

    // 3. Cancelar a assinatura no Mercado Pago
    await this.mercadoPagoService.cancelSubscription(subscription.external_id!);

    // 4. Atualizar o status no banco de dados
    const updatedSubscription = await this.subscriptionRepository.update(id, {
      status: SubscriptionStatus.CANCELLED,
      end_date: new Date()
    });

    return updatedSubscription;
  }

  /**
   * Pausa uma assinatura ativa
   * @param id ID da assinatura
   * @returns Assinatura atualizada
   */
  public async pauseSubscription(id: string): Promise<ISubscription> {
    // 1. Verificar se a assinatura existe
    const subscription = await this.subscriptionRepository.findById(id);
    
    if (!subscription) {
      throw new Error(`Assinatura com ID ${id} não encontrada`);
    }

    // 2. Verificar se a assinatura pode ser pausada
    if (
      subscription.status !== SubscriptionStatus.ACTIVE && 
      subscription.status !== SubscriptionStatus.AUTHORIZED
    ) {
      throw new Error(`Assinatura com status '${subscription.status}' não pode ser pausada`);
    }

    // 3. Pausar a assinatura no Mercado Pago
    await this.mercadoPagoService.pauseSubscription(subscription.external_id!);

    // 4. Atualizar o status no banco de dados
    const updatedSubscription = await this.subscriptionRepository.update(id, {
      status: SubscriptionStatus.PAUSED
    });

    return updatedSubscription;
  }

  /**
   * Reativa uma assinatura pausada
   * @param id ID da assinatura
   * @returns Assinatura atualizada
   */
  public async reactivateSubscription(id: string): Promise<ISubscription> {
    // 1. Verificar se a assinatura existe
    const subscription = await this.subscriptionRepository.findById(id);
    
    if (!subscription) {
      throw new Error(`Assinatura com ID ${id} não encontrada`);
    }

    // 2. Verificar se a assinatura pode ser reativada
    if (subscription.status !== SubscriptionStatus.PAUSED) {
      throw new Error(`Apenas assinaturas pausadas podem ser reativadas`);
    }

    // 3. Reativar a assinatura no Mercado Pago
    await this.mercadoPagoService.reactivateSubscription(subscription.external_id!);

    // 4. Atualizar o status no banco de dados
    const updatedSubscription = await this.subscriptionRepository.update(id, {
      status: SubscriptionStatus.ACTIVE
    });

    return updatedSubscription;
  }

  /**
   * Atualiza o status de uma assinatura com base em uma notificação
   * @param externalId ID externo da assinatura (Mercado Pago)
   * @returns Assinatura atualizada
   */
  public async updateSubscriptionStatus(externalId: string): Promise<ISubscription> {
    try {
      // 1. Consultar a assinatura no Mercado Pago
      const mpSubscription = await this.mercadoPagoService.getSubscription(externalId);
      
      // 2. Verificar se a assinatura existe no banco de dados
      const subscription = await this.subscriptionRepository.findByExternalId(externalId);
      
      if (!subscription) {
        throw new Error(`Assinatura com ID externo ${externalId} não encontrada`);
      }

      // 3. Atualizar o status e metadados
      const updatedSubscription = await this.subscriptionRepository.updateByExternalId(externalId, {
        status: mpSubscription.status,
        next_payment_date: mpSubscription.next_payment_date ? new Date(mpSubscription.next_payment_date) : undefined,
        metadata: {
          ...subscription.metadata,
          last_update: new Date().toISOString(),
        }
      });

      return updatedSubscription;
    } catch (error) {
      console.error(`❌ Erro ao atualizar status da assinatura ${externalId}:`, error);
      throw error;
    }
  }

  /**
   * Verifica se um usuário possui assinatura ativa
   * @param userId ID do usuário
   * @returns true se o usuário possuir assinatura ativa
   */
  public async hasActiveSubscription(userId: number): Promise<boolean> {
    const subscription = await this.subscriptionRepository.findActiveByUserId(userId);
    return !!subscription;
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

      if (action === 'preapproval.updated' || action === 'preapproval.created') {
        // Atualizar assinatura
        await this.updateSubscriptionStatus(resourceId);
        return { success: true, message: `Assinatura ${resourceId} atualizada com sucesso` };
      }

      return { success: true, message: `Ação ${action} recebida, mas não processada` };
    } catch (error) {
      console.error('❌ Erro ao processar webhook de assinatura:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido ao processar webhook' 
      };
    }
  }
}