import { compare, hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";
import {
  AuthResponse,
  LoginDTO,
  RegisterUserDTO,
  RegisterCompanyDTO,
  CreateUserDTO,
  UserPayload,
} from "@shared/interfaces/auth.interface";
import {
  AppError,
  ConflictError,
  NotFoundError,
} from "@shared/errors/app-error";
import { UserRepository } from "../repositories/user.repository";
import { TokenUtils } from "../utils/token.utils";
import { AuthValidation } from "../validations/auth.validation";

/**
 * Serviço de autenticação
 * Gerencia autenticação, registro e criação de usuários/empresas
 */
export class AuthService {
  private userRepository: UserRepository;
  private tokenUtils: TokenUtils;
  private saltRounds: number;

  /**
   * Construtor do serviço de autenticação
   * @param prisma Instância do cliente Prisma
   */
  constructor(prisma: PrismaClient) {
    this.userRepository = new UserRepository(prisma);
    this.tokenUtils = new TokenUtils(
      process.env.JWT_SECRET || "",
      parseInt(process.env.JWT_EXPIRES_IN_SECONDS || "28800", 10)
    );
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  }

  /**
   * Autentica um usuário com email e senha
   * @param loginData Dados de login
   * @returns Dados do usuário autenticado e token JWT
   */
  public async login(loginData: LoginDTO): Promise<AuthResponse> {
    // Validar dados de entrada
    const validatedData = AuthValidation.validateLogin(loginData);

    if (validatedData.isCompany) {
      return this.loginCompany(validatedData);
    } else {
      return this.loginUser(validatedData);
    }
  }

  /**
   * Autentica um usuário comum (não empresa)
   * @param loginData Dados de login validados
   * @returns Dados do usuário autenticado e token JWT
   */
  private async loginUser(loginData: LoginDTO): Promise<AuthResponse> {
    // Buscar usuário pelo email
    const user = await this.userRepository.findUserByEmail(loginData.email);

    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    // Verificar senha
    const passwordMatch = await compare(loginData.password, user.password);
    if (!passwordMatch) {
      throw new AppError("Credenciais inválidas", 401);
    }

    // Criar payload do token
    const payload: Omit<UserPayload, "iat" | "exp"> = {
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

    // Gerar token JWT
    const { token, expiresIn } = await this.tokenUtils.generateToken(payload);

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
      expiresIn,
    };
  }

  /**
   * Autentica uma empresa
   * @param loginData Dados de login validados
   * @returns Dados da empresa autenticada e token JWT
   */
  private async loginCompany(loginData: LoginDTO): Promise<AuthResponse> {
    // Buscar empresa pelo email
    const company = await this.userRepository.findCompanyByEmail(
      loginData.email
    );

    if (!company) {
      throw new AppError("Credenciais inválidas", 401);
    }

    // Verificar senha
    const passwordMatch = await compare(loginData.password, company.password);
    if (!passwordMatch) {
      throw new AppError("Credenciais inválidas", 401);
    }

    // Criar payload do token
    const payload: Omit<UserPayload, "iat" | "exp"> = {
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

    // Gerar token JWT
    const { token, expiresIn } = await this.tokenUtils.generateToken(payload);

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
      expiresIn,
    };
  }

  /**
   * Registra um novo usuário (aluno)
   * @param userData Dados do novo usuário
   * @returns Dados do usuário criado e token JWT
   */
  public async registerUser(userData: RegisterUserDTO): Promise<AuthResponse> {
    // Validar dados de entrada
    const validatedData = AuthValidation.validateRegisterUser(userData);

    // Verificar se o email já está em uso
    const existingUser = await this.userRepository.findUserByEmail(
      validatedData.email
    );
    if (existingUser) {
      throw new ConflictError("Email já está em uso");
    }

    // Verificar se o CPF já está em uso
    const existingCpf = await this.userRepository.findUserByCpf(
      validatedData.cpf
    );
    if (existingCpf) {
      throw new ConflictError("CPF já está cadastrado");
    }

    // Criptografar a senha
    const hashedPassword = await hash(validatedData.password, this.saltRounds);

    // Buscar o role de Aluno
    const alunoRole = await this.userRepository.findRoleByName("Aluno");
    if (!alunoRole) {
      throw new NotFoundError("Perfil de aluno não encontrado");
    }

    // Criar o endereço
    const address = await this.userRepository.createAddress(
      validatedData.address
    );

    // Criar um código de usuário único
    const codeUser =
      "ALU" +
      Math.floor(100000 + Math.random() * 900000)
        .toString()
        .substring(0, 6);

    // Criar o usuário
    const user = await this.userRepository.createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      birth_date: new Date(validatedData.birth_date),
      cpf: validatedData.cpf,
      phone_user: validatedData.phone_user,
      gender_id: validatedData.gender_id,
      education_id: validatedData.education_id,
      code_user: codeUser,
      role_id: alunoRole.id,
      address_id: address.id,
      status: 1,
    });

    // Criar payload do token
    const payload: Omit<UserPayload, "iat" | "exp"> = {
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

    // Gerar token JWT
    const { token, expiresIn } = await this.tokenUtils.generateToken(payload);

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
      expiresIn,
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
    // Validar dados de entrada
    const validatedData = AuthValidation.validateRegisterCompany(companyData);

    // Verificar se o email já está em uso
    const existingCompany = await this.userRepository.findCompanyByEmail(
      validatedData.email
    );
    if (existingCompany) {
      throw new ConflictError("Email já está em uso");
    }

    // Verificar se o CNPJ já está em uso
    const existingCnpj = await this.userRepository.findCompanyByCnpj(
      validatedData.cnpj
    );
    if (existingCnpj) {
      throw new ConflictError("CNPJ já está cadastrado");
    }

    // Criptografar a senha
    const hashedPassword = await hash(validatedData.password, this.saltRounds);

    // Buscar o role de Empresa
    const empresaRole = await this.userRepository.findRoleByName("Empresa");
    if (!empresaRole) {
      throw new NotFoundError("Perfil de empresa não encontrado");
    }

    // Criar o endereço
    const address = await this.userRepository.createAddress(
      validatedData.address
    );

    // Criar a empresa
    const company = await this.userRepository.createCompany({
      trade_name: validatedData.trade_name,
      business_name: validatedData.business_name,
      cnpj: validatedData.cnpj,
      contact_name: validatedData.contact_name,
      email: validatedData.email,
      password: hashedPassword,
      whatsapp: validatedData.whatsapp,
      mobile_phone: validatedData.mobile_phone,
      landline_phone: validatedData.landline_phone,
      address_id: address.id,
      role_id: empresaRole.id,
      status: 1, // Empresa inicia com status ativo
    });

    // Criar payload do token
    const payload: Omit<UserPayload, "iat" | "exp"> = {
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

    // Gerar token JWT
    const { token, expiresIn } = await this.tokenUtils.generateToken(payload);

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
      expiresIn,
    };
  }

  /**
   * Cria um novo usuário (admin, professor, recrutador, etc.)
   * @param userData Dados do novo usuário
   * @returns Dados do usuário criado sem a senha
   */
  public async createUser(userData: CreateUserDTO): Promise<any> {
    // Validar dados de entrada
    const validatedData = AuthValidation.validateCreateUser(userData);

    // Verificar se o email já está em uso
    const existingUser = await this.userRepository.findUserByEmail(
      validatedData.email
    );
    if (existingUser) {
      throw new ConflictError("Email já está em uso");
    }

    // Verificar se o CPF já está em uso
    const existingCpf = await this.userRepository.findUserByCpf(
      validatedData.cpf
    );
    if (existingCpf) {
      throw new ConflictError("CPF já está cadastrado");
    }

    // Criptografar a senha
    const hashedPassword = await hash(validatedData.password, this.saltRounds);

    // Buscar o role especificado
    const role = await this.userRepository.findRoleById(validatedData.role_id);
    if (!role) {
      throw new NotFoundError("Perfil não encontrado");
    }

    // Criar o endereço
    const address = await this.userRepository.createAddress(
      validatedData.address
    );

    // Gerar um código de usuário baseado no nome do role
    const rolePrefix = role.name.substring(0, 3).toUpperCase();
    const codeUser =
      rolePrefix +
      Math.floor(100000 + Math.random() * 900000)
        .toString()
        .substring(0, 6);

    // Criar o usuário
    const user = await this.userRepository.createUser({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      birth_date: new Date(validatedData.birth_date),
      cpf: validatedData.cpf,
      phone_user: validatedData.phone_user,
      gender_id: validatedData.gender_id,
      education_id: validatedData.education_id,
      code_user: codeUser,
      role_id: validatedData.role_id,
      address_id: address.id,
      status: validatedData.status || 1,
    });

    // Remover a senha do resultado
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
