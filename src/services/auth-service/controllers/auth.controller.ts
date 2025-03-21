import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthService } from "../services/auth.service";
import { AppError, ValidationError } from "@shared/errors/app-error";

/**
 * Controlador para operações de autenticação
 * Responsável por processar requisições HTTP relacionadas a autenticação
 */
export class AuthController {
  private authService: AuthService;

  /**
   * Construtor do controlador de autenticação
   * @param prisma Instância do cliente Prisma
   */
  constructor(prisma: PrismaClient) {
    this.authService = new AuthService(prisma);
  }

  /**
   * Autentica um usuário ou empresa
   * @param req Requisição com os dados de login
   * @param res Resposta da API
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const authResponse = await this.authService.login(req.body);

      res.status(200).json({
        status: "success",
        data: authResponse,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Registra um novo usuário (aluno)
   * @param req Requisição com os dados do usuário
   * @param res Resposta da API
   */
  public registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const authResponse = await this.authService.registerUser(req.body);

      res.status(201).json({
        status: "success",
        data: authResponse,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Registra uma nova empresa
   * @param req Requisição com os dados da empresa
   * @param res Resposta da API
   */
  public registerCompany = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const authResponse = await this.authService.registerCompany(req.body);

      res.status(201).json({
        status: "success",
        data: authResponse,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Cria um novo usuário (admin, professor, recrutador, etc.)
   * @param req Requisição com os dados do usuário
   * @param res Resposta da API
   */
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.createUser(req.body);

      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      this.handleError(res, error);
    }
  };

  /**
   * Obtém informações do usuário autenticado
   * @param req Requisição com o usuário autenticado
   * @param res Resposta da API
   */
  public getAuthenticatedUser = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Usuário não autenticado",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: req.user,
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
    console.error(`[Auth Error] ${error.message || "Unknown error"}`);

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
