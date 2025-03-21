// src/services/company-service/controllers/subscription.controller.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { SubscriptionService } from "../services/subscription.service";
import { AppError, ValidationError } from "@shared/errors/app-error";

/**
 * Controlador para operações relacionadas a assinaturas de empresas
 * Responsável por processar requisições HTTP relacionadas a assinaturas
 */
export class SubscriptionController {
  private subscriptionService: SubscriptionService;

  /**
   * Construtor do controlador de assinaturas
   * @param prisma Instância do cliente Prisma
   */
  constructor(prisma: PrismaClient) {
    this.subscriptionService = new SubscriptionService(prisma);
  }

  /**
   * Cria uma nova assinatura
   * @param req Requisição com os dados da assinatura
   * @param res Resposta da API
   */
  public createSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const subscription = await this.subscriptionService.createSubscription(
        req.body
      );

      res.status(201).json({
        status: "success",
        data: subscription,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Busca uma assinatura pelo ID
   * @param req Requisição com o ID da assinatura
   * @param res Resposta da API
   */
  public getSubscriptionById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({
          status: "error",
          message: "ID da assinatura inválido",
        });
        return;
      }

      const subscription = await this.subscriptionService.getSubscriptionById(
        id
      );

      res.status(200).json({
        status: "success",
        data: subscription,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Busca a assinatura ativa de uma empresa
   * @param req Requisição com o ID da empresa
   * @param res Resposta da API
   */
  public getActiveSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const companyId = parseInt(req.params.companyId, 10);

      if (isNaN(companyId)) {
        res.status(400).json({
          status: "error",
          message: "ID da empresa inválido",
        });
        return;
      }

      const subscription = await this.subscriptionService.getActiveSubscription(
        companyId
      );

      res.status(200).json({
        status: "success",
        data: subscription,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Lista assinaturas com filtros
   * @param req Requisição com filtros opcionais
   * @param res Resposta da API
   */
  public listSubscriptions = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.subscriptionService.listSubscriptions(
        req.query
      );

      res.status(200).json({
        status: "success",
        data: result.subscriptions,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          pages: result.totalPages,
        },
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Atualiza uma assinatura
   * @param req Requisição com o ID da assinatura e dados para atualização
   * @param res Resposta da API
   */
  public updateSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({
          status: "error",
          message: "ID da assinatura inválido",
        });
        return;
      }

      const subscription = await this.subscriptionService.updateSubscription(
        id,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: subscription,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Cancela uma assinatura
   * @param req Requisição com o ID da assinatura
   * @param res Resposta da API
   */
  public cancelSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({
          status: "error",
          message: "ID da assinatura inválido",
        });
        return;
      }

      const subscription = await this.subscriptionService.cancelSubscription(
        id,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: subscription,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Lista todos os planos de assinatura disponíveis
   * @param req Requisição
   * @param res Resposta da API
   */
  public listPlans = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const plans = await this.subscriptionService.listPlans(includeInactive);

      res.status(200).json({
        status: "success",
        data: plans,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Busca um plano de assinatura pelo ID
   * @param req Requisição com o ID do plano
   * @param res Resposta da API
   */
  public getPlanById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(400).json({
          status: "error",
          message: "ID do plano inválido",
        });
        return;
      }

      const plan = await this.subscriptionService.getPlanById(id);

      res.status(200).json({
        status: "success",
        data: plan,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Trata erros de forma padronizada
   * @param res Objeto de resposta
   * @param error Erro a ser tratado
   */
  private handleError(res: Response, error: any): void {
    console.error(`[Subscription Error] ${error.message || "Unknown error"}`);

    if (error instanceof ValidationError) {
      res.status(error.statusCode).json({
        status: "error",
        message: error.message,
        details: error.details,
      });
    } else if (error instanceof AppError) {
      res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Erro interno do servidor",
        ...(process.env.NODE_ENV === "development" && {
          details: error.message,
        }),
      });
    }
  }
}
