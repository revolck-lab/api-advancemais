// src/services/company-service/controllers/company.controller.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { CompanyService } from "../services/company.service";
import { AppError, ValidationError } from "@shared/errors/app-error";

/**
 * Controlador para operações relacionadas a empresas
 * Responsável por processar requisições HTTP relacionadas a empresas
 */
export class CompanyController {
  private companyService: CompanyService;

  /**
   * Construtor do controlador de empresas
   * @param prisma Instância do cliente Prisma
   */
  constructor(prisma: PrismaClient) {
    this.companyService = new CompanyService(prisma);
  }

  /**
   * Cria uma nova empresa
   * @param req Requisição com os dados da empresa
   * @param res Resposta da API
   */
  public createCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const company = await this.companyService.createCompany(req.body);

      res.status(201).json({
        status: "success",
        data: company,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Busca uma empresa pelo ID
   * @param req Requisição com o ID da empresa
   * @param res Resposta da API
   */
  public getCompanyById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "ID da empresa inválido",
        });
        return;
      }

      const company = await this.companyService.getCompanyById(id);

      res.status(200).json({
        status: "success",
        data: company,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Lista empresas com filtros
   * @param req Requisição com filtros opcionais
   * @param res Resposta da API
   */
  public getCompanies = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.companyService.listCompanies(req.query);

      res.status(200).json({
        status: "success",
        data: result.companies,
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
   * Atualiza os dados de uma empresa
   * @param req Requisição com o ID da empresa e dados para atualização
   * @param res Resposta da API
   */
  public updateCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "ID da empresa inválido",
        });
        return;
      }

      const company = await this.companyService.updateCompany(id, req.body);

      res.status(200).json({
        status: "success",
        data: company,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Atualiza o status de uma empresa
   * @param req Requisição com o ID da empresa e novo status
   * @param res Resposta da API
   */
  public updateCompanyStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "ID da empresa inválido",
        });
        return;
      }

      const company = await this.companyService.updateCompanyStatus(
        id,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: company,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Verifica se uma empresa possui assinatura ativa
   * @param req Requisição com o ID da empresa
   * @param res Resposta da API
   */
  public checkSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          status: "error",
          message: "ID da empresa inválido",
        });
        return;
      }

      const hasActiveSubscription =
        await this.companyService.hasActiveSubscription(id);

      res.status(200).json({
        status: "success",
        data: {
          hasActiveSubscription,
        },
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
    console.error(`[Company Error] ${error.message || "Unknown error"}`);

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
