import { PrismaClient, Company, Address, Prisma } from "@prisma/client";
import { NotFoundError } from "@shared/errors/app-error";
import { ErrorLogger } from "@shared/utils/error-logger";
import { CompanyFilters, PartialAddressDTO } from "../interfaces";

/**
 * Repositório para operações de acesso a dados relacionadas a empresas
 * Implementa operações CRUD e consultas específicas para empresas
 */
export class CompanyRepository {
  private readonly logger = ErrorLogger.getInstance();
  private readonly CONTEXT = "CompanyRepository";

  /**
   * Inicializa o repositório com a conexão do banco de dados
   * @param prisma Instância do cliente Prisma
   */
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Cria uma nova empresa com seu endereço
   * @param companyData Dados da empresa
   * @param addressData Dados do endereço
   * @returns Empresa criada com seus relacionamentos
   */
  async createCompany(
    companyData: Omit<
      Company,
      "id" | "created_at" | "updated_at" | "address_id"
    >,
    addressData: Omit<Address, "id">
  ): Promise<Company> {
    try {
      // Primeiro, crie o endereço
      const address = await this.prisma.address.create({
        data: addressData,
      });

      // Em seguida, crie a empresa com a referência ao endereço
      const company = await this.prisma.company.create({
        data: {
          ...companyData,
          address_id: address.id,
        },
        include: {
          address: true,
          role: true,
        },
      });

      return company;
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.createCompany`, {
        companyData: { ...companyData, password: "[REDACTED]" },
        addressData,
      });
      throw error;
    }
  }

  /**
   * Busca uma empresa pelo ID
   * @param id ID da empresa
   * @returns Empresa encontrada com suas relações ou null
   * @throws NotFoundError se especificado throwOnNotFound e não encontrar
   */
  async findById(
    id: number,
    throwOnNotFound: boolean = false
  ): Promise<Company | null> {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id },
        include: {
          address: true,
          role: true,
        },
      });

      if (!company && throwOnNotFound) {
        throw new NotFoundError(`Empresa com ID ${id} não encontrada`);
      }

      return company;
    } catch (error) {
      // Não logar NotFoundError se foi explicitamente solicitado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(error as Error, `${this.CONTEXT}.findById`, { id });
      throw error;
    }
  }

  /**
   * Busca uma empresa pelo CNPJ
   * @param cnpj CNPJ da empresa (somente números)
   * @returns Empresa encontrada ou null
   */
  async findByCnpj(cnpj: string): Promise<Company | null> {
    try {
      return await this.prisma.company.findUnique({
        where: { cnpj },
      });
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.findByCnpj`, {
        cnpj,
      });
      throw error;
    }
  }

  /**
   * Busca uma empresa pelo email
   * @param email Email da empresa
   * @returns Empresa encontrada ou null
   */
  async findByEmail(email: string): Promise<Company | null> {
    try {
      return await this.prisma.company.findUnique({
        where: { email },
      });
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.findByEmail`, {
        email,
      });
      throw error;
    }
  }

  /**
   * Lista empresas com filtros e paginação
   * @param filters Filtros para a listagem
   * @returns Lista de empresas e total
   */
  async findAll(
    filters: CompanyFilters
  ): Promise<{ companies: Company[]; total: number }> {
    try {
      const { status, search, page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      // Constrói a cláusula where com os filtros
      const where: any = {};

      if (status !== undefined) {
        where.status = status;
      }

      // Adiciona busca por texto em campos relevantes
      if (search) {
        where.OR = [
          { trade_name: { contains: search } },
          { business_name: { contains: search } },
          { cnpj: { contains: search } },
          { email: { contains: search } },
        ];
      }

      // Executa as consultas em paralelo para performance
      const [companies, total] = await Promise.all([
        this.prisma.company.findMany({
          where,
          include: {
            address: true,
            role: true,
          },
          skip,
          take: limit,
          orderBy: {
            created_at: "desc",
          },
        }),
        this.prisma.company.count({ where }),
      ]);

      return { companies, total };
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.findAll`, {
        filters,
      });
      throw error;
    }
  }

  /**
   * Atualiza os dados de uma empresa
   * @param id ID da empresa
   * @param companyData Dados a serem atualizados
   * @returns Empresa atualizada
   * @throws NotFoundError se a empresa não existir
   */
  async update(
    id: number,
    companyData: Partial<
      Omit<
        Company,
        "id" | "created_at" | "updated_at" | "address_id" | "password"
      >
    >
  ): Promise<Company> {
    try {
      // Verificar se a empresa existe
      const exists = await this.prisma.company.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!exists) {
        throw new NotFoundError(`Empresa com ID ${id} não encontrada`);
      }

      return await this.prisma.company.update({
        where: { id },
        data: {
          ...companyData,
          updated_at: new Date(),
        },
        include: {
          address: true,
          role: true,
        },
      });
    } catch (error) {
      // Não logar NotFoundError pois já foi tratado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(error as Error, `${this.CONTEXT}.update`, {
        id,
        companyData,
      });
      throw error;
    }
  }

  /**
   * Atualiza o status de uma empresa
   * @param id ID da empresa
   * @param status Novo status (0=inativo, 1=ativo)
   * @returns Empresa atualizada
   * @throws NotFoundError se a empresa não existir
   */
  async updateStatus(id: number, status: number): Promise<Company> {
    try {
      // Verificar se a empresa existe
      const exists = await this.prisma.company.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!exists) {
        throw new NotFoundError(`Empresa com ID ${id} não encontrada`);
      }

      return await this.prisma.company.update({
        where: { id },
        data: {
          status,
          updated_at: new Date(),
        },
        include: {
          address: true,
          role: true,
        },
      });
    } catch (error) {
      // Não logar NotFoundError pois já foi tratado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(error as Error, `${this.CONTEXT}.updateStatus`, {
        id,
        status,
      });
      throw error;
    }
  }

  /**
   * Atualiza o endereço de uma empresa
   * @param companyId ID da empresa
   * @param addressData Dados do endereço a serem atualizados
   * @returns Endereço atualizado
   * @throws NotFoundError se a empresa não existir
   */
  async updateAddress(
    companyId: number,
    addressData: PartialAddressDTO
  ): Promise<Address> {
    try {
      // Primeiro, busca o ID do endereço da empresa
      const company = await this.prisma.company.findUnique({
        where: { id: companyId },
        select: { address_id: true },
      });

      if (!company) {
        throw new NotFoundError(`Empresa com ID ${companyId} não encontrada`);
      }

      // Atualiza o endereço
      return await this.prisma.address.update({
        where: { id: company.address_id },
        data: {
          ...addressData,
          // Não atualizar state_id se não fornecido explicitamente
          state_id: addressData.state ? undefined : undefined,
        },
      });
    } catch (error) {
      // Não logar NotFoundError pois já foi tratado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(error as Error, `${this.CONTEXT}.updateAddress`, {
        companyId,
        addressData,
      });
      throw error;
    }
  }

  /**
   * Verifica se uma empresa possui assinatura ativa
   * @param companyId ID da empresa
   * @returns True se possui assinatura ativa
   * @throws NotFoundError se a empresa não existir
   */
  async hasActiveSubscription(companyId: number): Promise<boolean> {
    try {
      // Verifica se a empresa existe
      const companyExists = await this.prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
      });

      if (!companyExists) {
        throw new NotFoundError(`Empresa com ID ${companyId} não encontrada`);
      }

      // Busca por assinatura ativa
      const subscription = await this.prisma.companySubscription.findFirst({
        where: {
          company_id: companyId,
          status: {
            in: ["active", "authorized", "pending"],
          },
          OR: [{ end_date: null }, { end_date: { gt: new Date() } }],
        },
        select: { id: true },
      });

      return !!subscription;
    } catch (error) {
      // Não logar NotFoundError pois já foi tratado
      if (error instanceof NotFoundError) {
        throw error;
      }

      this.logger.logError(
        error as Error,
        `${this.CONTEXT}.hasActiveSubscription`,
        { companyId }
      );
      throw error;
    }
  }

  /**
   * Conta o número total de empresas
   * @param status Status opcional para filtro (0=inativo, 1=ativo)
   * @returns Total de empresas
   */
  async count(status?: number): Promise<number> {
    try {
      const where = status !== undefined ? { status } : {};
      return await this.prisma.company.count({ where });
    } catch (error) {
      this.logger.logError(error as Error, `${this.CONTEXT}.count`, { status });
      throw error;
    }
  }
}
