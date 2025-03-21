/**
 * Controlador para as operações de autenticação
 */

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthService } from "../auth.service";
import {
  LoginDTO,
  RegisterUserDTO,
  RegisterCompanyDTO,
  CreateUserDTO,
} from "@shared/interfaces/auth.interface";
import { AppError } from "@shared/errors/app-error";

/**
 * Controlador que gerencia as requisições de autenticação
 */
export class AuthController {
  private authService: AuthService;

  /**
   * Construtor do controlador de autenticação
   * @param prisma Instância do cliente Prisma para acesso ao banco de dados
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
      const loginData: LoginDTO = req.body;

      // Validação básica dos campos
      if (!loginData.email || !loginData.password) {
        res.status(400).json({
          status: "error",
          message: "Email e senha são obrigatórios",
        });
        return;
      }

      // Realiza o login através do serviço de autenticação
      const authResponse = await this.authService.login(loginData);

      res.status(200).json({
        status: "success",
        data: authResponse,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      console.error("❌ Erro no login:", error);
      res.status(500).json({
        status: "error",
        message: "Erro interno no servidor",
      });
    }
  };

  /**
   * Registra um novo usuário (aluno)
   * @param req Requisição com os dados do usuário
   * @param res Resposta da API
   */
  public registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: RegisterUserDTO = req.body;

      // Validação básica dos campos
      if (
        !userData.email ||
        !userData.password ||
        !userData.name ||
        !userData.cpf
      ) {
        res.status(400).json({
          status: "error",
          message: "Dados incompletos. Preencha todos os campos obrigatórios.",
        });
        return;
      }

      // Realiza o registro através do serviço de autenticação
      const authResponse = await this.authService.registerUser(userData);

      res.status(201).json({
        status: "success",
        data: authResponse,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      console.error("❌ Erro no registro de usuário:", error);
      res.status(500).json({
        status: "error",
        message: "Erro interno no servidor",
      });
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
      const companyData: RegisterCompanyDTO = req.body;

      // Validação básica dos campos
      if (
        !companyData.email ||
        !companyData.password ||
        !companyData.trade_name ||
        !companyData.cnpj
      ) {
        res.status(400).json({
          status: "error",
          message: "Dados incompletos. Preencha todos os campos obrigatórios.",
        });
        return;
      }

      // Realiza o registro através do serviço de autenticação
      const authResponse = await this.authService.registerCompany(companyData);

      res.status(201).json({
        status: "success",
        data: authResponse,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      console.error("❌ Erro no registro de empresa:", error);
      res.status(500).json({
        status: "error",
        message: "Erro interno no servidor",
      });
    }
  };

  /**
   * Cria um novo usuário (admin, professor, recrutador, etc.) - apenas para administradores
   * @param req Requisição com os dados do usuário
   * @param res Resposta da API
   */
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserDTO = req.body;

      // Validação básica dos campos
      if (
        !userData.email ||
        !userData.password ||
        !userData.name ||
        !userData.cpf ||
        !userData.role_id
      ) {
        res.status(400).json({
          status: "error",
          message: "Dados incompletos. Preencha todos os campos obrigatórios.",
        });
        return;
      }

      // Cria o usuário através do serviço de autenticação
      const user = await this.authService.createUser(userData);

      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          status: "error",
          message: error.message,
        });
        return;
      }

      console.error("❌ Erro na criação de usuário:", error);
      res.status(500).json({
        status: "error",
        message: "Erro interno no servidor",
      });
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
      // O middleware de autenticação já adicionou o usuário à requisição
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
      console.error("❌ Erro ao obter usuário autenticado:", error);
      res.status(500).json({
        status: "error",
        message: "Erro interno no servidor",
      });
    }
  };
}

export default AuthController;
