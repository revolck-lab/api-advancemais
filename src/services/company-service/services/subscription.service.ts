// src/services/company-service/services/subscription.service.ts

import { PrismaClient } from "@prisma/client";
import {
  CreateCompanySubscriptionDTO,
  UpdateSubscriptionDTO,
  CancelSubscriptionDTO,
  SubscriptionFilters,
  SubscriptionListResult,
} from "../interfaces/subscription.interface";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { CompanyRepository } from "../repositories/company.repository";
import { SubscriptionValidation } from "../validations/subscription.validation";
import {
  AppError,
  NotFoundError,
  ConflictError,
} from "@shared/errors/app-error";

/**
 * Serviço para operações relacionadas a assinaturas de empresas
 * Implementa toda a lógica de negócios relacionada ao gerenciamento de assinaturas
 */
export class SubscriptionService {
  private subscriptionRepository: SubscriptionRepository;
  private companyRepository: CompanyRepository;

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
  ): Promise<any> {
    // Validar dados de entrada
    const validatedData =
      SubscriptionValidation.validateCreate(subscriptionData);

    // Verificar se a empresa existe
    const company = await this.companyRepository.findById(
      validatedData.company_id
    );
    if (!company) {
      throw new NotFoundError(
        `Empresa com ID ${validatedData.company_id} não encontrada`
      );
    }

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
      validatedData.plan_id
    );
    if (!plan) {
      throw new NotFoundError(
        `Plano com ID ${validatedData.plan_id} não encontrado`
      );
    }

    // Preparar dados da assinatura
    const now = new Date();
    const subscriptionParams = {
      id: validatedData.external_id || `sub_${Date.now()}`,
      company_id: validatedData.company_id,
      plan_id: validatedData.plan_id,
      status: "active",
      start_date: now,
      end_date: null,
      next_payment_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 dias após o início
      payment_method_id: validatedData.payment_method_id,
      frequency: "monthly",
      frequency_type: "months",
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
    return subscription;
  }

  /**
   * Busca uma assinatura pelo ID
   * @param id ID da assinatura
   * @returns Assinatura encontrada
   */
  async getSubscriptionById(id: string): Promise<any> {
    const subscription = await this.subscriptionRepository.findById(id);

    if (!subscription) {
      throw new NotFoundError(`Assinatura com ID ${id} não encontrada`);
    }

    return subscription;
  }

  /**
   * Busca a assinatura ativa de uma empresa
   * @param companyId ID da empresa
   * @returns Assinatura ativa ou null
   */
  async getActiveSubscription(companyId: number): Promise<any> {
    // Verificar se a empresa existe
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(`Empresa com ID ${companyId} não encontrada`);
    }

    const subscription =
      await this.subscriptionRepository.findActiveByCompanyId(companyId);

    if (!subscription) {
      throw new NotFoundError(
        `Empresa com ID ${companyId} não possui assinatura ativa`
      );
    }

    return subscription;
  }

  /**
   * Lista assinaturas com filtros e paginação
   * @param filters Filtros para a listagem
   * @returns Lista de assinaturas e informações de paginação
   */
  async listSubscriptions(
    filters: SubscriptionFilters
  ): Promise<SubscriptionListResult> {
    // Validar e normalizar filtros
    const validatedFilters = SubscriptionValidation.validateFilters(filters);

    // Obter assinaturas filtradas
    const { subscriptions, total } = await this.subscriptionRepository.findAll(
      validatedFilters
    );

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
  ): Promise<any> {
    // Validar dados de entrada
    const validatedData = SubscriptionValidation.validateUpdate(updateData);

    // Verificar se a assinatura existe
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new NotFoundError(`Assinatura com ID ${id} não encontrada`);
    }

    // Se o status está sendo alterado para cancelado, usar o método de cancelamento
    if (validatedData.status === "cancelled") {
      return this.cancelSubscription(id, {
        cancellation_reason: "Cancelado via atualização de status",
      });
    }

    // Atualizar a assinatura
    const updatedSubscription = await this.subscriptionRepository.update(
      id,
      validatedData
    );
    return updatedSubscription;
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
  ): Promise<any> {
    // Validar dados de entrada
    const validatedData = SubscriptionValidation.validateCancel(cancelData);

    // Verificar se a assinatura existe
    const subscription = await this.subscriptionRepository.findById(id);
    if (!subscription) {
      throw new NotFoundError(`Assinatura com ID ${id} não encontrada`);
    }

    // Verificar se a assinatura já está cancelada
    if (
      subscription.status === "cancelled" ||
      subscription.status === "ended"
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
    return cancelledSubscription;
  }

  /**
   * Lista todos os planos de assinatura disponíveis
   * @param includeInactive Incluir planos inativos
   * @returns Lista de planos
   */
  async listPlans(includeInactive: boolean = false): Promise<any[]> {
    const status = includeInactive ? undefined : "active";
    return this.subscriptionRepository.findAllPlans(status);
  }

  /**
   * Busca um plano de assinatura pelo ID
   * @param id ID do plano
   * @returns Plano encontrado
   */
  async getPlanById(id: string): Promise<any> {
    const plan = await this.subscriptionRepository.findPlanById(id);

    if (!plan) {
      throw new NotFoundError(`Plano com ID ${id} não encontrado`);
    }

    return plan;
  }
}
