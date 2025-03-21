// src/services/company-service/services/company.service.ts

import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import {
  CreateCompanyDTO,
  UpdateCompanyDTO,
  UpdateCompanyStatusDTO,
  CompanyFilters,
  CompanyListResult,
} from "../interfaces/company.interface";
import { CompanyRepository } from "../repositories/company.repository";
import { CompanyValidation } from "../validations/company.validation";
import {
  AppError,
  NotFoundError,
  ConflictError,
} from "@shared/errors/app-error";

/**
 * Serviço para operações relacionadas a empresas
 * Implementa toda a lógica de negócios relacionada ao gerenciamento de empresas
 */
export class CompanyService {
  private companyRepository: CompanyRepository;
  private saltRounds: number;

  /**
   * Construtor do serviço de empresas
   * @param prisma Instância do cliente Prisma
   */
  constructor(prisma: PrismaClient) {
    this.companyRepository = new CompanyRepository(prisma);
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  }

  /**
   * Cria uma nova empresa
   * @param companyData Dados para criação da empresa
   * @returns Empresa criada
   */
  async createCompany(companyData: CreateCompanyDTO): Promise<any> {
    // Validar dados de entrada
    const validatedData = CompanyValidation.validateCreate(companyData);

    // Verificar se o CNPJ já está em uso
    const existingCnpj = await this.companyRepository.findByCnpj(
      validatedData.cnpj
    );
    if (existingCnpj) {
      throw new ConflictError("CNPJ já está cadastrado");
    }

    // Verificar se o email já está em uso
    const existingEmail = await this.companyRepository.findByEmail(
      validatedData.email
    );
    if (existingEmail) {
      throw new ConflictError("Email já está em uso");
    }

    // Criptografar a senha
    const hashedPassword = await hash(validatedData.password, this.saltRounds);

    // Separar os dados da empresa e do endereço
    const { address, ...companyInfo } = validatedData;

    // Pegar o ID do role de empresa (padrão é 3)
    const roleId = 3;

    // Criar a empresa com seu endereço
    const company = await this.companyRepository.createCompany(
      {
        ...companyInfo,
        password: hashedPassword,
        role_id: roleId,
        status: 1, // Ativo por padrão
      },
      address
    );

    // Remover a senha do resultado
    const { password, ...companyWithoutPassword } = company;
    return companyWithoutPassword;
  }

  /**
   * Busca uma empresa pelo ID
   * @param id ID da empresa
   * @returns Empresa encontrada
   */
  async getCompanyById(id: number): Promise<any> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new NotFoundError(`Empresa com ID ${id} não encontrada`);
    }

    // Remover a senha do resultado
    const { password, ...companyWithoutPassword } = company;
    return companyWithoutPassword;
  }

  /**
   * Lista empresas com filtros e paginação
   * @param filters Filtros para a listagem
   * @returns Lista de empresas e informações de paginação
   */
  async listCompanies(filters: CompanyFilters): Promise<CompanyListResult> {
    // Validar e normalizar filtros
    const validatedFilters = CompanyValidation.validateFilters(filters);

    // Obter empresas filtradas
    const { companies, total } = await this.companyRepository.findAll(
      validatedFilters
    );

    // Calcular dados de paginação
    const page = validatedFilters.page || 1;
    const limit = validatedFilters.limit || 10;
    const totalPages = Math.ceil(total / limit);

    // Remover senhas do resultado
    const companiesWithoutPasswords = companies.map((company) => {
      const { password, ...companyWithoutPassword } = company;
      return companyWithoutPassword;
    });

    return {
      companies: companiesWithoutPasswords,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Atualiza os dados de uma empresa
   * @param id ID da empresa
   * @param updateData Dados para atualização
   * @returns Empresa atualizada
   */
  async updateCompany(id: number, updateData: UpdateCompanyDTO): Promise<any> {
    // Validar dados de entrada
    const validatedData = CompanyValidation.validateUpdate(updateData);

    // Verificar se a empresa existe
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError(`Empresa com ID ${id} não encontrada`);
    }

    // Verificar se o email está sendo alterado e já está em uso
    if (validatedData.email && validatedData.email !== company.email) {
      const existingEmail = await this.companyRepository.findByEmail(
        validatedData.email
      );
      if (existingEmail) {
        throw new ConflictError("Email já está em uso");
      }
    }

    // Separar os dados da empresa e do endereço (se houver)
    const { address, ...companyData } = validatedData;

    // Atualizar a empresa
    const updatedCompany = await this.companyRepository.update(id, companyData);

    // Atualizar o endereço (se houver dados de endereço)
    if (address && Object.keys(address).length > 0) {
      await this.companyRepository.updateAddress(id, address);
    }

    // Buscar a empresa atualizada com todos os relacionamentos
    const refreshedCompany = await this.companyRepository.findById(id);

    if (!refreshedCompany) {
      throw new AppError("Erro ao buscar empresa atualizada", 500);
    }

    // Remover a senha do resultado
    const { password, ...companyWithoutPassword } = refreshedCompany;
    return companyWithoutPassword;
  }

  /**
   * Atualiza o status de uma empresa
   * @param id ID da empresa
   * @param statusData Dados do novo status
   * @returns Empresa atualizada
   */
  async updateCompanyStatus(
    id: number,
    statusData: UpdateCompanyStatusDTO
  ): Promise<any> {
    // Validar dados de entrada
    const validatedData = CompanyValidation.validateStatusUpdate(statusData);

    // Verificar se a empresa existe
    const company = await this.companyRepository.findById(id);
    if (!company) {
      throw new NotFoundError(`Empresa com ID ${id} não encontrada`);
    }

    // Se o status não mudou, não faz nada
    if (company.status === validatedData.status) {
      // Remover a senha do resultado
      const { password, ...companyWithoutPassword } = company;
      return companyWithoutPassword;
    }

    // Atualizar o status
    const updatedCompany = await this.companyRepository.updateStatus(
      id,
      validatedData.status
    );

    // Remover a senha do resultado
    const { password, ...companyWithoutPassword } = updatedCompany;
    return companyWithoutPassword;
  }

  /**
   * Verifica se uma empresa possui assinatura ativa
   * @param companyId ID da empresa
   * @returns True se a empresa tem assinatura ativa
   */
  async hasActiveSubscription(companyId: number): Promise<boolean> {
    // Verificar se a empresa existe
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(`Empresa com ID ${companyId} não encontrada`);
    }

    return this.companyRepository.hasActiveSubscription(companyId);
  }
}
