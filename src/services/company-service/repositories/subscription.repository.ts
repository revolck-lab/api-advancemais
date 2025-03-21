// src/services/company-service/repositories/subscription.repository.ts

import { PrismaClient, CompanySubscription } from "@prisma/client";
import { SubscriptionFilters } from "../interfaces/subscription.interface";

/**
 * Repositório para operações relacionadas a assinaturas de empresas
 * Centraliza todo o acesso a dados relacionados a assinaturas
 */
export class SubscriptionRepository {
  /**
   * Construtor do repositório de assinaturas
   * @param prisma Instância do cliente Prisma
   */
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Cria uma nova assinatura para uma empresa
   * @param subscriptionData Dados da assinatura
   * @returns Assinatura criada
   */
  async create(
    subscriptionData: Omit<CompanySubscription, "created_at" | "updated_at">
  ): Promise<CompanySubscription> {
    return this.prisma.companySubscription.create({
      data: subscriptionData,
      include: {
        company: true,
        plan: true,
      },
    });
  }

  /**
   * Busca uma assinatura pelo ID
   * @param id ID da assinatura
   * @returns Assinatura encontrada ou null
   */
  async findById(id: string): Promise<CompanySubscription | null> {
    return this.prisma.companySubscription.findUnique({
      where: { id },
      include: {
        company: true,
        plan: true,
      },
    });
  }

  /**
   * Busca assinaturas ativas de uma empresa
   * @param companyId ID da empresa
   * @returns Lista de assinaturas ativas
   */
  async findActiveByCompanyId(
    companyId: number
  ): Promise<CompanySubscription | null> {
    return this.prisma.companySubscription.findFirst({
      where: {
        company_id: companyId,
        status: {
          in: ["active", "authorized", "pending"],
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
  }

  /**
   * Lista assinaturas com filtros e paginação
   * @param filters Filtros para a listagem
   * @returns Lista de assinaturas e total
   */
  async findAll(
    filters: SubscriptionFilters
  ): Promise<{ subscriptions: CompanySubscription[]; total: number }> {
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

    // Filtragem por data de início
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
  }

  /**
   * Atualiza uma assinatura
   * @param id ID da assinatura
   * @param data Dados a serem atualizados
   * @returns Assinatura atualizada
   */
  async update(
    id: string,
    data: Partial<Omit<CompanySubscription, "id" | "created_at">>
  ): Promise<CompanySubscription> {
    return this.prisma.companySubscription.update({
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
  }

  /**
   * Cancela uma assinatura (atualiza o status para 'cancelled')
   * @param id ID da assinatura
   * @param reason Motivo do cancelamento (opcional)
   * @returns Assinatura atualizada
   */
  async cancel(id: string, reason?: string): Promise<CompanySubscription> {
    return this.prisma.companySubscription.update({
      where: { id },
      data: {
        status: "cancelled",
        end_date: new Date(),
        updated_at: new Date(),
        metadata: reason
          ? JSON.stringify({ cancellation_reason: reason })
          : undefined,
      },
      include: {
        company: true,
        plan: true,
      },
    });
  }

  /**
   * Busca um plano de assinatura pelo ID
   * @param id ID do plano
   * @returns Plano encontrado ou null
   */
  async findPlanById(id: string): Promise<any | null> {
    return this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });
  }

  /**
   * Lista todos os planos de assinatura disponíveis
   * @param status Status do plano (opcional)
   * @returns Lista de planos
   */
  async findAllPlans(status?: string): Promise<any[]> {
    const where = status ? { status } : {};

    return this.prisma.subscriptionPlan.findMany({
      where,
      orderBy: {
        plan_level: "asc",
      },
    });
  }
}
