import { PrismaClient } from "@prisma/client";
import {
  CreateCompanySubscriptionDTO,
  UpdateSubscriptionDTO,
  CancelSubscriptionDTO,
  SubscriptionFilters,
  SubscriptionListResult,
  SubscriptionStatus,
  Subscription,
  SubscriptionPlan,
} from "../interfaces/subscription.interface";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { SubscriptionValidation } from "../validations/subscription.validation";
import { NotFoundError, ConflictError } from "@shared/errors/app-error";
import { ErrorLogger } from "@shared/utils/error-logger";

/**
 * Serviço para operações relacionadas a assinaturas de empresas
 * Implementa toda a lógica de negócios relacionada ao gerenciamento de assinaturas
 */
export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;
  private companyRepository: CompanyRepository;
  private logger = ErrorLogger.getInstance();
  private readonly CONTEXT = "SubscriptionService";

  /**
   * Construtor do serviço de assinaturas
   * @param prisma Instância do cliente Prisma
   */
  constructor(prisma: PrismaClient) {
    this.subscriptionRepository = new SubscriptionRepository(prisma);
    this.companyRepository = new CompanyRepository(prisma);
  }

  /**
   * Cria uma nova assinatura para uma empresa
   * @param subscriptionData Dados para criação da assinatura
   * @returns Assinatura criada
   */
  async createSubscription(
    subscriptionData: CreateCompanySubscriptionDTO
  ): Promise<Subscription> {
    try {
      // Validar dados de entrada
      const validatedData =
        SubscriptionValidation.validateCreate(subscriptionData);

      // Verificar se a empresa existe
      const company = await this.companyRepository.findById(
        validatedData.company_id,
        true
      );

      // Verificar se a empresa já possui uma assinatura ativa
      const existingSubscription =
        await this.subscriptionRepository.findActiveByCompanyId(
          validatedData.company_id
        );
      if (existingSubscription) {
        throw new ConflictError("Empresa já possui uma assinatura ativa");
      }

      // Verificar se o plano existe
      const plan = await this.subscriptionRepository.findPlanById(
        validatedData.plan_id,
        true
      );

      // Preparar dados da assinatura
      const now = new Date();
      const nextPaymentDate = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      ); // 30 dias após o início

      const subscriptionParams = {
        id: validatedData.external_id || `sub_${Date.now()}`,
        company_id: validatedData.company_id,
        plan_id: validatedData.plan_id,
        status: SubscriptionStatus.ACTIVE,
        start_date: now,
        end_date: null,
        next_payment_date: nextPaymentDate,
        payment_method_id: validatedData.payment_method_id,
        frequency: "monthly", // Usando string para corresponder ao schema
        frequency_type: "months", // Usando string para corresponder ao schema
        auto_recurring: validatedData.auto_recurring || true,
        external_id: validatedData.external_id,
        is_exempted: validatedData.is_exempted || false,
        exemption_reason: validatedData.exemption_reason,
        exempted_by: validatedData.exempted_by,
        metadata: null,
      };

      // Criar a assinatura
      const subscription = await this.subscriptionRepository.create(
        subscriptionParams
      );

      this.logger.logInfo(
        `Assinatura criada: ID ${subscription.id} para empresa ${validatedData.company_id}`,
        this.CONTEXT
      );

      return subscription as unknown as Subscription;
    } catch (error) {
      this.logger.logError(
        error as Error,
        `${this.CONTEXT}.createSubscription`,
        {
          subscriptionData,
        }
      );
      throw error;
    }
  }

  /**
   * Busca uma assinatura pelo ID
   * @param id ID da assinatura
   * @returns Assinatura encontrada
   */
  async getSubscriptionById(id: string): Promise<Subscription> {
    try {
      const subscription = await this.subscriptionRepository.findById(id, true);
      return subscription as unknown as Subscription;
    } catch (error) {
      this.logger.logError(
        error as Error,
        `${this.CONTEXT}.getSubscriptionById`,
        { id }
      );
      throw error;
    }
  }

  /**
   * Busca a assinatura ativa de uma empresa
   * @param companyId ID da empresa
   * @returns Assinatura ativa ou null
   */
  async getActiveSubscription(companyId: number): Promise<Subscription> {
    try {
      // Verificar se a empresa existe
      const company = await this.companyRepository.findById(companyId, true);

      const subscription =
        await this.subscriptionRepository.findActiveByCompanyId(companyId);

      if (!subscription) {
        throw new NotFoundError(
          `Empresa com ID ${companyId} não possui assinatura ativa`
        );
      }

      return subscription as unknown as Subscription;
    } catch (error) {
      this.logger.logError(
        error as Error,
        `${this.CONTEXT}.getActiveSubscription`,
        {
          companyId,
        }
      );
      throw error;
    }
  }

  /**
   * Lista assinaturas com filtros e paginação
   * @param filters Filtros para a listagem
   * @returns Lista de assinaturas e informações de paginação
   */
  async listSubscriptions(
    filters: SubscriptionFilters
  ): Promise<SubscriptionListResult> {
    try {
      // Validar e normalizar filtros
      const validatedFilters = SubscriptionValidation.validateFilters(filters);

      // Obter assinaturas filtradas
      const { subscriptions: prismaSubscriptions, total } =
        await this.subscriptionRepository.findAll(validatedFilters);

      // Convertendo para o formato esperado pela interface
      const subscriptions = prismaSubscriptions as unknown as Subscription[];

      // Calcular dados de paginação
      const page = validatedFilters.page || 1;
      const limit = validatedFilters.limit || 10;
      const totalPages = Math.ceil(total / limit);

      return {
        subscriptions,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.logError(
        error as Error,
        `${this.CONTEXT}.listSubscriptions`,
        {
          filters,
        }
      );
      throw error;
    }
  }

  /**
   * Atualiza uma assinatura
   * @param id ID da assinatura
   * @param updateData Dados para atualização
   * @returns Assinatura atualizada
   */
  async updateSubscription(
    id: string,
    updateData: UpdateSubscriptionDTO
  ): Promise<Subscription> {
    try {
      // Validar dados de entrada
      const validatedData = SubscriptionValidation.validateUpdate(updateData);

      // Verificar se a assinatura existe
      const subscription = await this.subscriptionRepository.findById(id, true);

      // Se o status está sendo alterado para cancelado, usar o método de cancelamento
      if (validatedData.status === SubscriptionStatus.CANCELLED) {
        return this.cancelSubscription(id, {
          cancellation_reason: "Cancelado via atualização de status",
        });
      }

      // Preparar os dados compatíveis com o schema Prisma
      const updateParams: any = {};

      if (validatedData.status) {
        updateParams.status = validatedData.status;
      }

      if (validatedData.end_date) {
        updateParams.end_date = validatedData.end_date;
      }

      if (validatedData.next_payment_date) {
        updateParams.next_payment_date = validatedData.next_payment_date;
      }

      if (validatedData.is_exempted !== undefined) {
        updateParams.is_exempted = validatedData.is_exempted;

        if (validatedData.is_exempted) {
          updateParams.exemption_reason = validatedData.exemption_reason;
          updateParams.exempted_by = validatedData.exempted_by;
          updateParams.exemption_date = new Date();
        }
      }

      // Atualizar a assinatura
      const updatedSubscription = await this.subscriptionRepository.update(
        id,
        updateParams
      );

      this.logger.logInfo(`Assinatura atualizada: ID ${id}`, this.CONTEXT);
      return updatedSubscription as unknown as Subscription;
    } catch (error) {
      this.logger.logError(
        error as Error,
        `${this.CONTEXT}.updateSubscription`,
        {
          id,
          updateData,
        }
      );
      throw error;
    }
  }

  /**
   * Cancela uma assinatura
   * @param id ID da assinatura
   * @param cancelData Dados do cancelamento
   * @returns Assinatura cancelada
   */
  async cancelSubscription(
    id: string,
    cancelData: CancelSubscriptionDTO = {}
  ): Promise<Subscription> {
    try {
      // Validar dados de entrada
      const validatedData = SubscriptionValidation.validateCancel(cancelData);

      // Verificar se a assinatura existe
      const subscription = await this.subscriptionRepository.findById(id, true);

      // Verificar se a assinatura já está cancelada
      if (
        subscription.status === SubscriptionStatus.CANCELLED ||
        subscription.status === SubscriptionStatus.ENDED
      ) {
        throw new ConflictError(
          `Assinatura com ID ${id} já está ${subscription.status}`
        );
      }

      // Preparar metadados para o cancelamento
      const metadata = {
        cancellation_reason:
          validatedData.cancellation_reason || "Cancelado pelo usuário",
        canceled_by: validatedData.canceled_by,
        canceled_at: new Date().toISOString(),
      };

      // Cancelar a assinatura (definir status, data de término e metadados)
      const cancelledSubscription = await this.subscriptionRepository.cancel(
        id,
        JSON.stringify(metadata)
      );

      this.logger.logInfo(`Assinatura cancelada: ID ${id}`, this.CONTEXT);
      return cancelledSubscription as unknown as Subscription;
    } catch (error) {
      this.logger.logError(
        error as Error,
        `${this.CONTEXT}.cancelSubscription`,
        {
          id,
          cancelData,
        }
      );
      throw error;
    }
  }

  /**
   * Lista todos os planos de assinatura disponíveis
   * @param includeInactive Incluir planos inativos
   * @returns Lista de planos
   */
  async listPlans(
    includeInactive: boolean = false
  ): Promise<SubscriptionPlan[]> {
    try {
      const status = includeInactive ? undefined : "active";
      const plans = await this.subscriptionRepository.findAllPlans(status);
      return plans as unknown as SubscriptionPlan[];
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.listPlans`, {
        includeInactive,
      });
      throw error;
    }
  }

  /**
   * Busca um plano de assinatura pelo ID
   * @param id ID do plano
   * @returns Plano encontrado
   */
  async getPlanById(id: string): Promise<SubscriptionPlan> {
    try {
      const plan = await this.subscriptionRepository.findPlanById(id, true);
      return plan as unknown as SubscriptionPlan;
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.getPlanById`, {
        id,
      });
      throw error;
    }
  }
}
