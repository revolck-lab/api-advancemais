/**
 * Serviço centralizado de autenticação
 * Gerencia autenticação de usuários e empresas, geração de tokens JWT e validação
 */

import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { SignJWT } from "jose";
import {
  LoginDTO,
  RegisterUserDTO,
  RegisterCompanyDTO,
  UserPayload,
  AuthResponse,
  CreateUserDTO,
} from "@shared/interfaces/auth.interface";
import { AppError } from "@shared/errors/app-error";

/**
 * Classe que implementa os serviços de autenticação
 */
export class AuthService {
  private prisma: PrismaClient;
  private tokenExpiresIn: number;

  /**
   * Construtor do serviço de autenticação
   * @param prisma Instância do cliente Prisma para acesso ao banco de dados
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    // Tempo de expiração do token em segundos (8 horas)
    this.tokenExpiresIn = 8 * 60 * 60;
  }

  /**
   * Gera um token JWT para o usuário ou empresa autenticada
   * @param payload Dados do usuário para incluir no token
   * @returns Token JWT assinado
   */
  private async generateToken(payload: UserPayload): Promise<string> {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // Adiciona a data de expiração ao payload
    const now = Math.floor(Date.now() / 1000);
    payload.iat = now;
    payload.exp = now + this.tokenExpiresIn;

    // Cria e assina o token
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(payload.exp)
      .setIssuedAt(payload.iat)
      .setNotBefore(payload.iat)
      .sign(secret);

    return token;
  }

  /**
   * Autentica um usuário com email e senha
   * @param loginData Dados de login (email e senha)
   * @returns Dados do usuário autenticado e token JWT
   */
  public async login(loginData: LoginDTO): Promise<AuthResponse> {
    // Determina se o login é de empresa ou usuário comum
    const isCompanyLogin = loginData.isCompany === true;

    if (isCompanyLogin) {
      // Login de empresa
      const company = await this.prisma.company.findUnique({
        where: { email: loginData.email },
        include: {
          role: true,
        },
      });

      if (!company) {
        throw new AppError("Credenciais inválidas", 401);
      }

      // Verifica a senha
      const passwordMatch = await compare(loginData.password, company.password);
      if (!passwordMatch) {
        throw new AppError("Credenciais inválidas", 401);
      }

      // Cria o payload com os dados da empresa
      const payload: UserPayload = {
        id: company.id,
        email: company.email,
        name: company.trade_name,
        role: {
          id: company.role_id,
          name: company.role.name,
          level: company.role.level,
        },
        isCompany: true,
        companyId: company.id,
      };

      // Gera o token JWT
      const token = await this.generateToken(payload);

      return {
        user: {
          id: company.id,
          name: company.trade_name,
          email: company.email,
          role: {
            id: company.role_id,
            name: company.role.name,
            level: company.role.level,
          },
          isCompany: true,
          companyId: company.id,
        },
        token,
        expiresIn: this.tokenExpiresIn,
      };
    } else {
      // Login de usuário comum
      const user = await this.prisma.user.findUnique({
        where: { email: loginData.email },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new AppError("Credenciais inválidas", 401);
      }

      // Verifica a senha
      const passwordMatch = await compare(loginData.password, user.password);
      if (!passwordMatch) {
        throw new AppError("Credenciais inválidas", 401);
      }

      // Cria o payload com os dados do usuário
      const payload: UserPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: {
          id: user.role_id,
          name: user.role.name,
          level: user.role.level,
        },
        isCompany: false,
      };

      // Gera o token JWT
      const token = await this.generateToken(payload);

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: {
            id: user.role_id,
            name: user.role.name,
            level: user.role.level,
          },
          isCompany: false,
        },
        token,
        expiresIn: this.tokenExpiresIn,
      };
    }
  }

  /**
   * Registra um novo usuário (aluno)
   * @param userData Dados do novo usuário
   * @returns Dados do usuário criado e token JWT
   */
  public async registerUser(userData: RegisterUserDTO): Promise<AuthResponse> {
    // Verifica se o email já está em uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("Email já está em uso", 400);
    }

    // Verifica se o CPF já está em uso
    const existingCpf = await this.prisma.user.findUnique({
      where: { cpf: userData.cpf },
    });

    if (existingCpf) {
      throw new AppError("CPF já está cadastrado", 400);
    }

    // Criptografa a senha
    const hashedPassword = await hash(userData.password, 10);

    // Busca o role de Aluno
    const alunoRole = await this.prisma.role.findFirst({
      where: { name: "Aluno" },
    });

    if (!alunoRole) {
      throw new AppError("Perfil de aluno não encontrado", 500);
    }

    // Cria o endereço
    const address = await this.prisma.address.create({
      data: userData.address,
    });

    // Cria um código de usuário único
    const codeUser =
      "ALU" +
      Math.floor(100000 + Math.random() * 900000)
        .toString()
        .substring(0, 6);

    // Cria o usuário
    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        birth_date: new Date(userData.birth_date),
        cpf: userData.cpf,
        phone_user: userData.phone_user,
        gender_id: userData.gender_id,
        education_id: userData.education_id,
        code_user: codeUser,
        role_id: alunoRole.id,
        address_id: address.id,
        status: 1,
      },
      include: {
        role: true,
      },
    });

    // Cria o payload com os dados do usuário
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: {
        id: user.role_id,
        name: user.role.name,
        level: user.role.level,
      },
      isCompany: false,
    };

    // Gera o token JWT
    const token = await this.generateToken(payload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: {
          id: user.role_id,
          name: user.role.name,
          level: user.role.level,
        },
        isCompany: false,
      },
      token,
      expiresIn: this.tokenExpiresIn,
    };
  }

  /**
   * Registra uma nova empresa
   * @param companyData Dados da nova empresa
   * @returns Dados da empresa criada e token JWT
   */
  public async registerCompany(
    companyData: RegisterCompanyDTO
  ): Promise<AuthResponse> {
    // Verifica se o email já está em uso
    const existingCompany = await this.prisma.company.findUnique({
      where: { email: companyData.email },
    });

    if (existingCompany) {
      throw new AppError("Email já está em uso", 400);
    }

    // Verifica se o CNPJ já está em uso
    const existingCnpj = await this.prisma.company.findUnique({
      where: { cnpj: companyData.cnpj },
    });

    if (existingCnpj) {
      throw new AppError("CNPJ já está cadastrado", 400);
    }

    // Criptografa a senha
    const hashedPassword = await hash(companyData.password, 10);

    // Busca o role de Empresa
    const empresaRole = await this.prisma.role.findFirst({
      where: { name: "Empresa" },
    });

    if (!empresaRole) {
      throw new AppError("Perfil de empresa não encontrado", 500);
    }

    // Cria o endereço
    const address = await this.prisma.address.create({
      data: companyData.address,
    });

    // Cria a empresa
    const company = await this.prisma.company.create({
      data: {
        trade_name: companyData.trade_name,
        business_name: companyData.business_name,
        cnpj: companyData.cnpj,
        contact_name: companyData.contact_name,
        email: companyData.email,
        password: hashedPassword,
        whatsapp: companyData.whatsapp,
        mobile_phone: companyData.mobile_phone,
        landline_phone: companyData.landline_phone,
        address_id: address.id,
        role_id: empresaRole.id,
        status: 1, // Empresa inicia com status pendente (revisão manual)
      },
      include: {
        role: true,
      },
    });

    // Cria o payload com os dados da empresa
    const payload: UserPayload = {
      id: company.id,
      email: company.email,
      name: company.trade_name,
      role: {
        id: company.role_id,
        name: company.role.name,
        level: company.role.level,
      },
      isCompany: true,
      companyId: company.id,
    };

    // Gera o token JWT
    const token = await this.generateToken(payload);

    return {
      user: {
        id: company.id,
        name: company.trade_name,
        email: company.email,
        role: {
          id: company.role_id,
          name: company.role.name,
          level: company.role.level,
        },
        isCompany: true,
        companyId: company.id,
      },
      token,
      expiresIn: this.tokenExpiresIn,
    };
  }

  /**
   * Cria um novo usuário (admin, professor, recrutador, etc.) - apenas para administradores
   * @param userData Dados do novo usuário
   * @returns Dados do usuário criado
   */
  public async createUser(userData: CreateUserDTO): Promise<any> {
    // Verifica se o email já está em uso
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("Email já está em uso", 400);
    }

    // Verifica se o CPF já está em uso
    const existingCpf = await this.prisma.user.findUnique({
      where: { cpf: userData.cpf },
    });

    if (existingCpf) {
      throw new AppError("CPF já está cadastrado", 400);
    }

    // Criptografa a senha
    const hashedPassword = await hash(userData.password, 10);

    // Busca o role especificado
    const role = await this.prisma.role.findUnique({
      where: { id: userData.role_id },
    });

    if (!role) {
      throw new AppError("Perfil não encontrado", 404);
    }

    // Cria o endereço
    const address = await this.prisma.address.create({
      data: userData.address,
    });

    // Gera um código de usuário baseado no nome do role
    const rolePrefix = role.name.substring(0, 3).toUpperCase();
    const codeUser =
      rolePrefix +
      Math.floor(100000 + Math.random() * 900000)
        .toString()
        .substring(0, 6);

    // Cria o usuário
    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        birth_date: new Date(userData.birth_date),
        cpf: userData.cpf,
        phone_user: userData.phone_user,
        gender_id: userData.gender_id,
        education_id: userData.education_id,
        code_user: codeUser,
        role_id: userData.role_id,
        address_id: address.id,
        status: userData.status || 1,
      },
      include: {
        role: true,
        gender: true,
        education: true,
        address: true,
      },
    });

    // Remove a senha do resultado
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}

export default AuthService;
