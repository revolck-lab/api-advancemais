import { PrismaClient, User, Company, Role, Address } from "@prisma/client";

/**
 * Repositório para operações relacionadas a usuários e empresas
 * Centraliza todo o acesso a dados relacionados à autenticação
 */
export class UserRepository {
  /**
   * Construtor do repositório de usuários
   * @param prisma Instância do cliente Prisma
   */
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Busca um usuário pelo email com seu perfil de acesso
   * @param email Email do usuário
   * @returns Usuário ou null se não encontrado
   */
  async findUserByEmail(
    email: string
  ): Promise<(User & { role: Role }) | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  /**
   * Busca um usuário pelo CPF
   * @param cpf CPF do usuário
   * @returns Usuário ou null se não encontrado
   */
  async findUserByCpf(cpf: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { cpf },
    });
  }

  /**
   * Busca uma empresa pelo email com seu perfil de acesso
   * @param email Email da empresa
   * @returns Empresa ou null se não encontrada
   */
  async findCompanyByEmail(
    email: string
  ): Promise<(Company & { role: Role }) | null> {
    return this.prisma.company.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  /**
   * Busca uma empresa pelo CNPJ
   * @param cnpj CNPJ da empresa
   * @returns Empresa ou null se não encontrada
   */
  async findCompanyByCnpj(cnpj: string): Promise<Company | null> {
    return this.prisma.company.findUnique({
      where: { cnpj },
    });
  }

  /**
   * Busca um perfil de acesso pelo nome
   * @param name Nome do perfil
   * @returns Perfil ou null se não encontrado
   */
  async findRoleByName(name: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { name },
    });
  }

  /**
   * Busca um perfil de acesso pelo ID
   * @param id ID do perfil
   * @returns Perfil ou null se não encontrado
   */
  async findRoleById(id: number): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
    });
  }

  /**
   * Cria um novo endereço
   * @param addressData Dados do endereço
   * @returns Endereço criado
   */
  async createAddress(addressData: {
    address: string;
    city: string;
    state: string;
    cep: string;
    number: number;
  }): Promise<Address> {
    return this.prisma.address.create({
      data: addressData,
    });
  }

  /**
   * Cria um novo usuário com todas as referências necessárias
   * @param userData Dados do usuário
   * @returns Usuário criado
   */
  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    birth_date: Date;
    cpf: string;
    phone_user: string;
    gender_id: number;
    education_id: number;
    code_user: string;
    role_id: number;
    address_id: number;
    status: number;
  }): Promise<
    User & { role: Role; gender: any; education: any; address: Address }
  > {
    return this.prisma.user.create({
      data: userData,
      include: {
        role: true,
        gender: true,
        education: true,
        address: true,
      },
    });
  }

  /**
   * Cria uma nova empresa
   * @param companyData Dados da empresa
   * @returns Empresa criada
   */
  async createCompany(companyData: {
    trade_name: string;
    business_name: string;
    cnpj: string;
    contact_name: string;
    email: string;
    password: string;
    whatsapp: string;
    mobile_phone: string;
    landline_phone?: string;
    address_id: number;
    role_id: number;
    status: number;
  }): Promise<Company & { role: Role }> {
    return this.prisma.company.create({
      data: companyData,
      include: {
        role: true,
      },
    });
  }
}
