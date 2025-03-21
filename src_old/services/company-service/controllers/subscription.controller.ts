import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BaseController } from "./base.controller";
import { SubscriptionService } from "../services/subscription.service";
import {
  CancelSubscriptionDTO,
  CreateCompanySubscriptionDTO,
  Subscription,
  SubscriptionFilters,
  SubscriptionListResult,
  SubscriptionPlan,
  SubscriptionStatus,
  UpdateSubscriptionDTO,
} from "../interfaces/subscription.interface";
import { AppError } from "@shared/errors/app-error";

export class SubscriptionController extends BaseController {
  private subscriptionService: SubscriptionService;
  private readonly CONTEXT = "SubscriptionController";

  /**
   * Inicializa o controlador com dependências necessárias
   * @param prisma Instância do cliente Prisma
   */
  constructor(prisma: PrismaClient) {
    super();
    this.subscriptionService = new SubscriptionService(prisma);
  }

  /**
   * Cria uma nova assinatura
   * @route POST /api/companies/subscriptions
   * @param req Requisição com os dados da assinatura no corpo
   * @param res Resposta da API
   */
  public createSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const subscriptionData = req.body as CreateCompanySubscriptionDTO;
        const subscription = await this.subscriptionService.createSubscription(
          subscriptionData
        );
        this.sendSuccess<Subscription>(
          res,
          subscription,
          "Assinatura criada com sucesso",
          201
        );
      },
      `${this.CONTEXT}.createSubscription`
    );
  };

  /**
   * Busca uma assinatura pelo ID
   * @route GET /api/companies/subscriptions/:id
   * @param req Requisição com o ID da assinatura na URL
   * @param res Resposta da API
   */
  public getSubscriptionById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const id = req.params.id;

        if (!id) {
          throw new AppError("ID da assinatura não informado", 400);
        }

        const subscription = await this.subscriptionService.getSubscriptionById(
          id
        );
        this.sendSuccess<Subscription>(res, subscription);
      },
      `${this.CONTEXT}.getSubscriptionById`
    );
  };

  /**
   * Busca a assinatura ativa de uma empresa
   * @route GET /api/companies/subscriptions/company/:companyId
   * @param req Requisição com o ID da empresa na URL
   * @param res Resposta da API
   */
  public getActiveSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const companyId = this.extractId(req, "companyId");
        if (companyId === null) return;

        const subscription =
          await this.subscriptionService.getActiveSubscription(companyId);
        this.sendSuccess<Subscription>(res, subscription);
      },
      `${this.CONTEXT}.getActiveSubscription`
    );
  };

  /**
   * Lista assinaturas com filtros
   * @route GET /api/companies/subscriptions
   * @param req Requisição com filtros opcionais nos query params
   * @param res Resposta da API
   */
  public listSubscriptions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const filters: SubscriptionFilters = {
          ...this.getPaginationParams(req.query),
          company_id: req.query.company_id
            ? parseInt(req.query.company_id as string, 10)
            : undefined,
          status: req.query.status as SubscriptionStatus | undefined,
          plan_id: req.query.plan_id as string | undefined,
          is_exempted: req.query.is_exempted === "true",
          start_date: req.query.start_date
            ? new Date(req.query.start_date as string)
            : undefined,
          end_date: req.query.end_date
            ? new Date(req.query.end_date as string)
            : undefined,
        };

        const result = await this.subscriptionService.listSubscriptions(
          filters
        );
        this.sendSuccess<SubscriptionListResult>(res, result);
      },
      `${this.CONTEXT}.listSubscriptions`
    );
  };

  /**
   * Atualiza uma assinatura
   * @route PUT /api/companies/subscriptions/:id
   * @param req Requisição com o ID da assinatura na URL e dados no corpo
   * @param res Resposta da API
   */
  public updateSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const id = req.params.id;

        if (!id) {
          throw new AppError("ID da assinatura não informado", 400);
        }

        const updateData = req.body as UpdateSubscriptionDTO;
        const subscription = await this.subscriptionService.updateSubscription(
          id,
          updateData
        );
        this.sendSuccess<Subscription>(
          res,
          subscription,
          "Assinatura atualizada com sucesso"
        );
      },
      `${this.CONTEXT}.updateSubscription`
    );
  };

  /**
   * Cancela uma assinatura
   * @route POST /api/companies/subscriptions/:id/cancel
   * @param req Requisição com o ID da assinatura na URL
   * @param res Resposta da API
   */
  public cancelSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const id = req.params.id;

        if (!id) {
          throw new AppError("ID da assinatura não informado", 400);
        }

        const cancelData = req.body as CancelSubscriptionDTO;
        const subscription = await this.subscriptionService.cancelSubscription(
          id,
          cancelData
        );
        this.sendSuccess<Subscription>(
          res,
          subscription,
          "Assinatura cancelada com sucesso"
        );
      },
      `${this.CONTEXT}.cancelSubscription`
    );
  };

  /**
   * Lista todos os planos disponíveis
   * @route GET /api/companies/subscriptions/plans
   * @param req Requisição com filtros opcionais
   * @param res Resposta da API
   */
  public listPlans = async (req: Request, res: Response): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const includeInactive = req.query.includeInactive === "true";
        const plans = await this.subscriptionService.listPlans(includeInactive);
        this.sendSuccess<SubscriptionPlan[]>(res, plans);
      },
      `${this.CONTEXT}.listPlans`
    );
  };

  /**
   * Busca um plano pelo ID
   * @route GET /api/companies/subscriptions/plans/:id
   * @param req Requisição com o ID do plano na URL
   * @param res Resposta da API
   */
  public getPlanById = async (req: Request, res: Response): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const id = req.params.id;

        if (!id) {
          throw new AppError("ID do plano não informado", 400);
        }

        const plan = await this.subscriptionService.getPlanById(id);
        this.sendSuccess<SubscriptionPlan>(res, plan);
      },
      `${this.CONTEXT}.getPlanById`
    );
  };
}
