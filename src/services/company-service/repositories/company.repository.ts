// src/services/company-service/repositories/company.repository.ts

import { PrismaClient, Company, Address } from "@prisma/client";
import { CompanyFilters } from "../interfaces/company.interface";

/**
 * Repositório para operações relacionadas a empresas
 * Centraliza todo o acesso a dados relacionados a empresas
 */
export class CompanyRepository {
  /**
   * Construtor do repositório de empresas
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
    return this.prisma.company.create({
      data: {
        ...companyData,
        address: {
          create: addressData,
        },
      },
      include: {
        address: true,
        role: true,
      },
    });
  }

  /**
   * Busca uma empresa pelo ID
   * @param id ID da empresa
   * @returns Empresa encontrada ou null
   */
  async findById(id: number): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        address: true,
        role: true,
      },
    });
  }

  /**
   * Busca uma empresa pelo CNPJ
   * @param cnpj CNPJ da empresa
   * @returns Empresa encontrada ou null
   */
  async findByCnpj(cnpj: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { cnpj },
    });
  }

  /**
   * Busca uma empresa pelo email
   * @param email Email da empresa
   * @returns Empresa encontrada ou null
   */
  async findByEmail(email: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { email },
    });
  }

  /**
   * Lista empresas com filtros e paginação
   * @param filters Filtros para a listagem
   * @returns Lista de empresas e total
   */
  async findAll(
    filters: CompanyFilters
  ): Promise<{ companies: Company[]; total: number }> {
    const { status, page = 1, limit = 10 } = filters;

    const where: any = {};

    if (status !== undefined) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

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
  }

  /**
   * Atualiza os dados de uma empresa
   * @param id ID da empresa
   * @param companyData Dados a serem atualizados
   * @returns Empresa atualizada
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
    return this.prisma.company.update({
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
  }

  /**
   * Atualiza o status de uma empresa
   * @param id ID da empresa
   * @param status Novo status
   * @returns Empresa atualizada
   */
  async updateStatus(id: number, status: number): Promise<Company> {
    return this.prisma.company.update({
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
  }

  /**
   * Atualiza o endereço de uma empresa
   * @param id ID da empresa
   * @param addressData Dados do endereço
   * @returns Endereço atualizado
   */
  async updateAddress(
    companyId: number,
    addressData: Partial<Omit<Address, "id" | "state_id">>
  ): Promise<Address> {
    // Primeiro, busca o ID do endereço da empresa
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { address_id: true },
    });

    if (!company) {
      throw new Error(`Empresa com ID ${companyId} não encontrada`);
    }

    // Atualiza o endereço
    return this.prisma.address.update({
      where: { id: company.address_id },
      data: addressData,
    });
  }

  /**
   * Verifica se uma empresa possui assinatura ativa
   * @param companyId ID da empresa
   * @returns True se possui assinatura ativa
   */
  async hasActiveSubscription(companyId: number): Promise<boolean> {
    const subscription = await this.prisma.companySubscription.findFirst({
      where: {
        company_id: companyId,
        status: {
          in: ["active", "authorized", "pending"],
        },
        OR: [{ end_date: null }, { end_date: { gt: new Date() } }],
      },
    });

    return !!subscription;
  }

  /**
   * Conta o número total de empresas
   * @param status Status opcional para filtro
   * @returns Total de empresas
   */
  async count(status?: number): Promise<number> {
    const where = status !== undefined ? { status } : {};
    return this.prisma.company.count({ where });
  }
}
