import {
  PrismaClient,
  CompanySubscription,
  SubscriptionPlan,
} from "@prisma/client";
import { ErrorLogger } from "@shared/utils/error-logger";
import { NotFoundError } from "@shared/errors/app-error";
import {
  SubscriptionFilters,
  SubscriptionStatus,
  SubscriptionFrequency,
  FrequencyType,
} from "../interfaces";

/**
 * Repositório para operações de acesso a dados relacionadas a assinaturas
 * Implementa operações CRUD e consultas específicas para assinaturas de empresas
 */
export class SubscriptionRepository {
  private readonly logger = ErrorLogger.getInstance();
  private readonly CONTEXT = "SubscriptionRepository";

  /**
   * Inicializa o repositório com a conexão do banco de dados
   * @param prisma Instância do cliente Prisma
   */
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Cria uma nova assinatura para uma empresa
   * @param subscriptionData Dados da assinatura
   * @returns Assinatura criada com suas relações
   */
  async create(
    subscriptionData: Omit<CompanySubscription, "created_at" | "updated_at">
  ): Promise<CompanySubscription> {
    try {
      return await this.prisma.companySubscription.create({
        data: subscriptionData,
        include: {
          company: true,
          plan: true,
        },
      });
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.create`, {
        subscriptionData: {
          ...subscriptionData,
          // Não logar dados sensíveis se presentes
          metadata: subscriptionData.metadata ? "[REDACTED]" : undefined,
        },
      });
      throw error;
    }
  }

  /**
   * Busca uma assinatura pelo ID
   * @param id ID da assinatura
   * @returns Assinatura encontrada com suas relações ou null
   * @throws NotFoundError se especificado throwOnNotFound e não encontrar
   */
  async findById(
    id: string,
    throwOnNotFound: boolean = false
  ): Promise<CompanySubscription | null> {
    try {
      const subscription = await this.prisma.companySubscription.findUnique({
        where: { id },
        include: {
          company: true,
          plan: true,
        },
      });

      if (!subscription && throwOnNotFound) {
        throw new NotFoundError(`Assinatura com ID ${id} não encontrada`);
      }

      return subscription;
    } catch (error) {
      // Não logar NotFoundError se foi explicitamente solicitado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(error as Error, `${this.CONTEXT}.findById`, { id });
      throw error;
    }
  }

  /**
   * Busca uma assinatura pelo ID externo
   * @param externalId ID externo da assinatura
   * @returns Assinatura encontrada com suas relações ou null
   */
  async findByExternalId(
    externalId: string
  ): Promise<CompanySubscription | null> {
    try {
      return await this.prisma.companySubscription.findUnique({
        where: { external_id: externalId },
        include: {
          company: true,
          plan: true,
        },
      });
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.findByExternalId`, {
        externalId,
      });
      throw error;
    }
  }

  /**
   * Busca assinaturas ativas de uma empresa
   * @param companyId ID da empresa
   * @returns Assinatura ativa mais recente ou null
   */
  async findActiveByCompanyId(
    companyId: number
  ): Promise<CompanySubscription | null> {
    try {
      return await this.prisma.companySubscription.findFirst({
        where: {
          company_id: companyId,
          status: {
            in: [
              SubscriptionStatus.ACTIVE,
              SubscriptionStatus.AUTHORIZED,
              SubscriptionStatus.PENDING,
            ],
          },
          OR: [{ end_date: null }, { end_date: { gt: new Date() } }],
        },
        include: {
          company: true,
          plan: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });
    } catch (error) {
      this.logger.logError(
        error as Error,
        `${this.CONTEXT}.findActiveByCompanyId`,
        { companyId }
      );
      throw error;
    }
  }

  /**
   * Lista assinaturas com filtros e paginação
   * @param filters Filtros para a listagem
   * @returns Lista de assinaturas e total de registros
   */
  async findAll(
    filters: SubscriptionFilters
  ): Promise<{ subscriptions: CompanySubscription[]; total: number }> {
    try {
      const {
        company_id,
        status,
        plan_id,
        is_exempted,
        start_date,
        end_date,
        page = 1,
        limit = 10,
      } = filters;

      const skip = (page - 1) * limit;

      // Constrói a cláusula where com os filtros
      const where: any = {};

      if (company_id !== undefined) {
        where.company_id = company_id;
      }

      if (status !== undefined) {
        where.status = status;
      }

      if (plan_id !== undefined) {
        where.plan_id = plan_id;
      }

      if (is_exempted !== undefined) {
        where.is_exempted = is_exempted;
      }

      // Filtragem por data de criação
      if (start_date || end_date) {
        where.created_at = {};

        if (start_date) {
          where.created_at.gte = start_date;
        }

        if (end_date) {
          where.created_at.lte = end_date;
        }
      }

      // Executa as consultas em paralelo para performance
      const [subscriptions, total] = await Promise.all([
        this.prisma.companySubscription.findMany({
          where,
          include: {
            company: true,
            plan: true,
          },
          skip,
          take: limit,
          orderBy: {
            created_at: "desc",
          },
        }),
        this.prisma.companySubscription.count({ where }),
      ]);

      return { subscriptions, total };
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.findAll`, {
        filters,
      });
      throw error;
    }
  }

  /**
   * Atualiza uma assinatura
   * @param id ID da assinatura
   * @param data Dados parciais a serem atualizados
   * @returns Assinatura atualizada com suas relações
   * @throws NotFoundError se a assinatura não existir
   */
  async update(
    id: string,
    data: Partial<Omit<CompanySubscription, "id" | "created_at">>
  ): Promise<CompanySubscription> {
    try {
      // Verificar se a assinatura existe
      const exists = await this.prisma.companySubscription.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!exists) {
        throw new NotFoundError(`Assinatura com ID ${id} não encontrada`);
      }

      // Atualizar a assinatura
      return await this.prisma.companySubscription.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        },
        include: {
          company: true,
          plan: true,
        },
      });
    } catch (error) {
      // Não logar NotFoundError pois já foi tratado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(error as Error, `${this.CONTEXT}.update`, {
        id,
        data: {
          ...data,
          // Não logar dados sensíveis se presentes
          metadata: data.metadata ? "[REDACTED]" : undefined,
        },
      });
      throw error;
    }
  }

  /**
   * Cancela uma assinatura (atualiza o status para 'cancelled')
   * @param id ID da assinatura
   * @param metadata Metadados do cancelamento em formato JSON
   * @returns Assinatura cancelada com suas relações
   * @throws NotFoundError se a assinatura não existir
   */
  async cancel(id: string, metadata?: string): Promise<CompanySubscription> {
    try {
      // Verificar se a assinatura existe
      const exists = await this.prisma.companySubscription.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!exists) {
        throw new NotFoundError(`Assinatura com ID ${id} não encontrada`);
      }

      // Cancelar a assinatura
      return await this.prisma.companySubscription.update({
        where: { id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          end_date: new Date(),
          updated_at: new Date(),
          metadata: metadata || undefined,
        },
        include: {
          company: true,
          plan: true,
        },
      });
    } catch (error) {
      // Não logar NotFoundError pois já foi tratado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(error as Error, `${this.CONTEXT}.cancel`, { id });
      throw error;
    }
  }

  /**
   * Busca um plano de assinatura pelo ID
   * @param id ID do plano
   * @returns Plano encontrado ou null
   * @throws NotFoundError se especificado throwOnNotFound e não encontrar
   */
  async findPlanById(
    id: string,
    throwOnNotFound: boolean = false
  ): Promise<SubscriptionPlan | null> {
    try {
      const plan = await this.prisma.subscriptionPlan.findUnique({
        where: { id },
      });

      if (!plan && throwOnNotFound) {
        throw new NotFoundError(`Plano com ID ${id} não encontrado`);
      }

      return plan;
    } catch (error) {
      // Não logar NotFoundError se foi explicitamente solicitado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(error as Error, `${this.CONTEXT}.findPlanById`, {
        id,
      });
      throw error;
    }
  }

  /**
   * Lista todos os planos de assinatura disponíveis
   * @param status Status do plano (opcional)
   * @returns Lista de planos
   */
  async findAllPlans(status?: string): Promise<SubscriptionPlan[]> {
    try {
      const where = status ? { status } : {};

      return await this.prisma.subscriptionPlan.findMany({
        where,
        orderBy: {
          plan_level: "asc",
        },
      });
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.findAllPlans`, {
        status,
      });
      throw error;
    }
  }

  /**
   * Transforma os tipos de string para enum
   * Método utilitário para converter valores do banco para os enums definidos
   * @param subscription Assinatura do banco de dados
   * @returns Assinatura com tipos convertidos
   */
  private mapFrequencyEnums(
    subscription: CompanySubscription
  ): CompanySubscription {
    // Map frequency string to enum
    let frequency: SubscriptionFrequency;
    switch (subscription.frequency?.toLowerCase()) {
      case "monthly":
        frequency = SubscriptionFrequency.MONTHLY;
        break;
      case "bimonthly":
        frequency = SubscriptionFrequency.BIMONTHLY;
        break;
      case "quarterly":
        frequency = SubscriptionFrequency.QUARTERLY;
        break;
      case "biannual":
        frequency = SubscriptionFrequency.BIANNUAL;
        break;
      case "annual":
        frequency = SubscriptionFrequency.ANNUAL;
        break;
      default:
        frequency = SubscriptionFrequency.MONTHLY;
    }

    // Map frequency_type string to enum
    let frequencyType: FrequencyType;
    switch (subscription.frequency_type?.toLowerCase()) {
      case "days":
        frequencyType = FrequencyType.DAYS;
        break;
      case "months":
        frequencyType = FrequencyType.MONTHS;
        break;
      case "years":
        frequencyType = FrequencyType.YEARS;
        break;
      default:
        frequencyType = FrequencyType.MONTHS;
    }

    return {
      ...subscription,
      frequency,
      frequency_type: frequencyType,
    } as CompanySubscription;
  }
}
