import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { BaseController } from "./base.controller";
import { CompanyService } from "../services/company.service";
import {
  Company,
  CompanyFilters,
  CompanyListResult,
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateCompanyStatusDTO,
} from "../interfaces/company.interface";

export class CompanyController extends BaseController {
  private companyService: CompanyService;
  private readonly CONTEXT = "CompanyController";

  /**
   * Inicializa o controlador com dependências necessárias
   * @param prisma Instância do cliente Prisma
   */
  constructor(prisma: PrismaClient) {
    super();
    this.companyService = new CompanyService(prisma);
  }

  /**
   * Cria uma nova empresa
   * @route POST /api/companies
   * @param req Requisição com os dados da empresa no corpo
   * @param res Resposta da API
   */
  public createCompany = async (req: Request, res: Response): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const companyData = req.body as CreateCompanyDTO;
        const company = await this.companyService.createCompany(companyData);
        this.sendSuccess<Partial<Company>>(
          res,
          company,
          "Empresa criada com sucesso",
          201
        );
      },
      `${this.CONTEXT}.createCompany`
    );
  };

  /**
   * Busca uma empresa pelo ID
   * @route GET /api/companies/:id
   * @param req Requisição com o ID da empresa na URL
   * @param res Resposta da API
   */
  public getCompanyById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const id = this.extractId(req);
        if (id === null) return;

        const company = await this.companyService.getCompanyById(id);
        this.sendSuccess<Partial<Company>>(res, company);
      },
      `${this.CONTEXT}.getCompanyById`
    );
  };

  /**
   * Lista empresas com filtros
   * @route GET /api/companies
   * @param req Requisição com filtros opcionais nos query params
   * @param res Resposta da API
   */
  public getCompanies = async (req: Request, res: Response): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const filters: CompanyFilters = {
          ...this.getPaginationParams(req.query),
          status:
            req.query.status !== undefined
              ? Number(req.query.status)
              : undefined,
          search: req.query.search as string | undefined,
        };

        const result = await this.companyService.listCompanies(filters);
        this.sendSuccess<CompanyListResult>(res, result);
      },
      `${this.CONTEXT}.getCompanies`
    );
  };

  /**
   * Atualiza os dados de uma empresa
   * @route PUT /api/companies/:id
   * @param req Requisição com o ID da empresa na URL e dados no corpo
   * @param res Resposta da API
   */
  public updateCompany = async (req: Request, res: Response): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const id = this.extractId(req);
        if (id === null) return;

        const updateData = req.body as UpdateCompanyDTO;
        const company = await this.companyService.updateCompany(id, updateData);
        this.sendSuccess<Partial<Company>>(
          res,
          company,
          "Empresa atualizada com sucesso"
        );
      },
      `${this.CONTEXT}.updateCompany`
    );
  };

  /**
   * Atualiza o status de uma empresa
   * @route PATCH /api/companies/:id/status
   * @param req Requisição com o ID da empresa na URL e novo status no corpo
   * @param res Resposta da API
   */
  public updateCompanyStatus = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const id = this.extractId(req);
        if (id === null) return;

        const statusData = req.body as UpdateCompanyStatusDTO;
        const company = await this.companyService.updateCompanyStatus(
          id,
          statusData
        );

        const statusMessage =
          statusData.status === 1
            ? "Empresa ativada com sucesso"
            : "Empresa desativada com sucesso";

        this.sendSuccess<Partial<Company>>(res, company, statusMessage);
      },
      `${this.CONTEXT}.updateCompanyStatus`
    );
  };

  /**
   * Verifica se uma empresa possui assinatura ativa
   * @route GET /api/companies/:id/subscription/check
   * @param req Requisição com o ID da empresa na URL
   * @param res Resposta da API
   */
  public checkSubscription = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeHandler(
      req,
      res,
      async () => {
        const id = this.extractId(req);
        if (id === null) return;

        const hasActiveSubscription =
          await this.companyService.hasActiveSubscription(id);

        this.sendSuccess(res, {
          hasActiveSubscription,
          companyId: id,
        });
      },
      `${this.CONTEXT}.checkSubscription`
    );
  };
}
