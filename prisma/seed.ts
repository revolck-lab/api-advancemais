// Este arquivo deve ser colocado em: prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed do banco de dados...");

  // ==================== ROLES (PERFIS) ====================
  console.log("Criando roles (perfis)...");

  const roles = [
    { name: "Professor", level: 1, status: 1 },
    { name: "Aluno", level: 2, status: 1 },
    { name: "Empresa", level: 3, status: 1 },
    { name: "Administrador", level: 4, status: 1 },
    { name: "Recrutadores", level: 5, status: 1 },
    { name: "Setor Pedagógico", level: 6, status: 1 },
    { name: "Recursos Humanos", level: 7, status: 1 },
    { name: "Super Administrador", level: 8, status: 1 },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // ==================== GÊNEROS ====================
  console.log("Criando gêneros...");

  const genders = [
    { name: "Masculino" },
    { name: "Feminino" },
    { name: "Não-binário" },
    { name: "Prefiro não informar" },
  ];

  for (const gender of genders) {
    await prisma.gender.upsert({
      where: { name: gender.name },
      update: {},
      create: gender,
    });
  }

  // ==================== NÍVEIS EDUCACIONAIS ====================
  console.log("Criando níveis educacionais...");

  const educationLevels = [
    { name: "Ensino Fundamental Incompleto" },
    { name: "Ensino Fundamental Completo" },
    { name: "Ensino Médio Incompleto" },
    { name: "Ensino Médio Completo" },
    { name: "Ensino Superior Incompleto" },
    { name: "Ensino Superior Completo" },
    { name: "Pós-graduação" },
    { name: "Mestrado" },
    { name: "Doutorado" },
  ];

  for (const level of educationLevels) {
    await prisma.education.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
  }

  // ==================== CATEGORIAS DE CURSOS ====================
  console.log("Criando categorias de cursos...");

  const courseCategories = [
    {
      name: "ONLINE",
      description:
        "Cursos realizados totalmente online, com conteúdo gravado disponível 24/7.",
    },
    {
      name: "LIVE",
      description: "Cursos com aulas ao vivo em datas e horários específicos.",
    },
    {
      name: "PRESENCIAL",
      description: "Cursos realizados presencialmente em local físico.",
    },
    {
      name: "HÍBRIDO",
      description: "Cursos que combinam atividades online e presenciais.",
    },
  ];

  for (const category of courseCategories) {
    await prisma.courseCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // ==================== TIPOS DE CURSOS ====================
  console.log("Criando tipos de cursos...");

  const courseTypes = [
    {
      name: "GRATUITO",
      description: "Cursos oferecidos sem custo para o aluno.",
    },
    {
      name: "PAGO",
      description: "Cursos que exigem pagamento para acesso.",
    },
  ];

  for (const type of courseTypes) {
    await prisma.courseType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  // ==================== TIPOS DE AULAS ====================
  console.log("Criando tipos de aulas...");

  const lessonTypes = [
    {
      name: "VIDEO",
      description: "Aula em formato de vídeo gravado.",
    },
    {
      name: "TEXTO",
      description: "Aula em formato de texto/leitura.",
    },
    {
      name: "QUIZ",
      description: "Atividade interativa com perguntas e respostas.",
    },
    {
      name: "LIVE",
      description: "Aula ao vivo com interação em tempo real.",
    },
    {
      name: "DOCUMENTO",
      description: "Material em formato de documento para download.",
    },
    {
      name: "TAREFA",
      description: "Atividade prática para entrega.",
    },
    {
      name: "FÓRUM",
      description: "Discussão em grupo sobre um tema específico.",
    },
  ];

  for (const type of lessonTypes) {
    await prisma.lessonType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }

  // ==================== PLANOS DE ASSINATURA ====================
  console.log("Criando planos de assinatura...");

  const subscriptionPlans = [
    {
      name: "Inicial",
      description: "Comece a recrutar com eficiência",
      amount: 49.99,
      currency_id: "BRL",
      payment_type_id: "credit_card",
      frequency: 1,
      frequency_type: "months",
      status: "active",
      auto_recurring: true,
      active_jobs_limit: 3,
      is_featured: false,
      featured_jobs: 0,
      has_advanced_dashboard: false,
      plan_level: 1,
      features: JSON.stringify([
        "3 vagas ativas",
        "30 dias de divulgação",
        "Acesso a candidatos qualificados",
        "Painel de controle básico",
      ]),
    },
    {
      name: "Intermediário",
      description: "Amplie seu alcance de recrutamento",
      amount: 74.99,
      currency_id: "BRL",
      payment_type_id: "credit_card",
      frequency: 1,
      frequency_type: "months",
      status: "active",
      auto_recurring: true,
      active_jobs_limit: 10,
      is_featured: false,
      featured_jobs: 0,
      has_advanced_dashboard: false,
      plan_level: 2,
      features: JSON.stringify([
        "10 vagas ativas",
        "30 dias de divulgação",
        "Acesso a candidatos qualificados",
        "Painel de controle básico",
      ]),
    },
    {
      name: "Avançado",
      description: "Solução completa para grandes equipes",
      amount: 99.99,
      currency_id: "BRL",
      payment_type_id: "credit_card",
      frequency: 1,
      frequency_type: "months",
      status: "active",
      auto_recurring: true,
      active_jobs_limit: 20,
      is_featured: true,
      featured_jobs: 0,
      has_advanced_dashboard: false,
      plan_level: 3,
      features: JSON.stringify([
        "20 vagas ativas",
        "30 dias de divulgação",
        "Acesso a candidatos qualificados",
        "Painel de controle básico",
      ]),
    },
    {
      name: "Destaque",
      description: "Recrutamento sem limites",
      amount: 199.99,
      currency_id: "BRL",
      payment_type_id: "credit_card",
      frequency: 1,
      frequency_type: "months",
      status: "active",
      auto_recurring: true,
      active_jobs_limit: 999, // Praticamente ilimitado
      is_featured: true,
      featured_jobs: 1,
      has_advanced_dashboard: true,
      plan_level: 4,
      features: JSON.stringify([
        "Vagas ilimitadas",
        "30 dias de divulgação",
        "Acesso a candidatos qualificados",
        "Painel de controle avançado",
        "1 vaga em destaque",
      ]),
    },
  ];

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  // ==================== TIPOS DE CONTRATO ====================
  console.log("Criando tipos de contrato...");

  const contractTypes = [
    {
      name: "CLT",
      description:
        "Contrato sob o regime CLT (Consolidação das Leis do Trabalho)",
      status: "active",
    },
    {
      name: "PJ",
      description: "Contrato como Pessoa Jurídica",
      status: "active",
    },
    {
      name: "Estágio",
      description: "Contrato de estágio para estudantes",
      status: "active",
    },
    {
      name: "Trainee",
      description: "Programa de trainee para recém-formados",
      status: "active",
    },
    {
      name: "Temporário",
      description: "Contrato por tempo determinado",
      status: "active",
    },
    {
      name: "Autônomo",
      description: "Prestação de serviços como profissional autônomo",
      status: "active",
    },
  ];

  for (const contractType of contractTypes) {
    await prisma.contractType.upsert({
      where: { name: contractType.name },
      update: {},
      create: contractType,
    });
  }

  // ==================== MODELOS DE TRABALHO ====================
  console.log("Criando modelos de trabalho...");

  const workModels = [
    {
      name: "Presencial",
      description: "Trabalho realizado exclusivamente no local da empresa",
      status: "active",
    },
    {
      name: "Remoto",
      description: "Trabalho realizado totalmente à distância",
      status: "active",
    },
    {
      name: "Híbrido",
      description: "Combinação de trabalho presencial e remoto",
      status: "active",
    },
    {
      name: "Flexível",
      description: "Horários flexíveis de acordo com a necessidade",
      status: "active",
    },
  ];

  for (const workModel of workModels) {
    await prisma.workModel.upsert({
      where: { name: workModel.name },
      update: {},
      create: workModel,
    });
  }

  // ==================== CATEGORIAS DE VAGAS ====================
  console.log("Criando categorias de vagas...");

  const jobCategories = [
    {
      name: "Direito Civil",
      description: "Vagas relacionadas à área de Direito Civil",
      status: "active",
    },
    {
      name: "Direito Trabalhista",
      description: "Vagas relacionadas à área de Direito Trabalhista",
      status: "active",
    },
    {
      name: "Direito Tributário",
      description: "Vagas relacionadas à área de Direito Tributário",
      status: "active",
    },
    {
      name: "Direito Penal",
      description: "Vagas relacionadas à área de Direito Penal",
      status: "active",
    },
    {
      name: "Direito Empresarial",
      description: "Vagas relacionadas à área de Direito Empresarial",
      status: "active",
    },
    {
      name: "Direito Ambiental",
      description: "Vagas relacionadas à área de Direito Ambiental",
      status: "active",
    },
    {
      name: "Direito Internacional",
      description: "Vagas relacionadas à área de Direito Internacional",
      status: "active",
    },
    {
      name: "Direito Digital",
      description: "Vagas relacionadas à área de Direito Digital e Tecnologia",
      status: "active",
    },
    {
      name: "Direito Previdenciário",
      description: "Vagas relacionadas à área de Direito Previdenciário",
      status: "active",
    },
    {
      name: "Gestão Jurídica",
      description: "Vagas para gestão de departamentos jurídicos",
      status: "active",
    },
    {
      name: "Administrativo Jurídico",
      description:
        "Vagas para funções administrativas em escritórios e departamentos jurídicos",
      status: "active",
    },
  ];

  for (const jobCategory of jobCategories) {
    await prisma.jobCategory.upsert({
      where: { name: jobCategory.name },
      update: {},
      create: jobCategory,
    });
  }

  // ==================== USUÁRIO ADMINISTRADOR PADRÃO ====================
  console.log("Criando usuário administrador padrão...");

  // Buscar IDs necessários
  const adminRole = await prisma.role.findUnique({
    where: { name: "Administrador" },
  });
  const gender = await prisma.gender.findFirst();
  const education = await prisma.education.findFirst();

  if (!adminRole || !gender || !education) {
    throw new Error(
      "Dados necessários para criar administrador não encontrados"
    );
  }

  // Criar endereço para o admin
  const adminAddress = await prisma.address.upsert({
    where: { id: 1 },
    update: {},
    create: {
      address: "Rua Exemplo",
      city: "São Paulo",
      state: "SP",
      cep: "01000000",
      number: 123,
    },
  });

  // Criar usuário admin
  const hashedPassword = await hash("Admin@123", 10);
  await prisma.user.upsert({
    where: { email: "admin@advancemais.com" },
    update: {},
    create: {
      name: "Administrador Sistema",
      email: "admin@advancemais.com",
      password: hashedPassword,
      birth_date: new Date("1990-01-01"),
      cpf: "12345678900",
      phone_user: "11999999999",
      gender_id: gender.id,
      education_id: education.id,
      code_user: "ADM001",
      role_id: adminRole.id,
      address_id: adminAddress.id,
      status: 1,
    },
  });

  // ==================== USUÁRIO RECRUTADOR PADRÃO ====================
  console.log("Criando usuário recrutador padrão...");

  // Buscar role de recrutador
  const recruiterRole = await prisma.role.findUnique({
    where: { name: "Recrutadores" },
  });

  if (!recruiterRole) {
    throw new Error("Role de recrutador não encontrada");
  }

  // Criar endereço para o recrutador
  const recruiterAddress = await prisma.address.upsert({
    where: { id: 2 },
    update: {},
    create: {
      address: "Rua dos Recrutadores",
      city: "São Paulo",
      state: "SP",
      cep: "01001000",
      number: 456,
    },
  });

  // Criar usuário recrutador
  const recruiterPassword = await hash("Recruiter@123", 10);
  await prisma.user.upsert({
    where: { email: "recrutador@advancemais.com" },
    update: {},
    create: {
      name: "Recrutador Sistema",
      email: "recrutador@advancemais.com",
      password: recruiterPassword,
      birth_date: new Date("1992-05-15"),
      cpf: "98765432100",
      phone_user: "11988888888",
      gender_id: gender.id,
      education_id: education.id,
      code_user: "REC001",
      role_id: recruiterRole.id,
      address_id: recruiterAddress.id,
      status: 1,
    },
  });

  // ==================== EMPRESA DEMONSTRAÇÃO ====================
  console.log("Criando empresa de demonstração...");

  // Buscar role de empresa
  const companyRole = await prisma.role.findUnique({
    where: { name: "Empresa" },
  });

  if (!companyRole) {
    throw new Error("Role de empresa não encontrada");
  }

  // Criar endereço para a empresa demo
  const companyAddress = await prisma.address.upsert({
    where: { id: 3 },
    update: {},
    create: {
      address: "Avenida Paulista",
      city: "São Paulo",
      state: "SP",
      cep: "01310100",
      number: 1000,
    },
  });

  // Criar empresa demo
  const companyPassword = await hash("Company@123", 10);
  const companyDemo = await prisma.company.upsert({
    where: { email: "demo@advancemais.com" },
    update: {},
    create: {
      cnpj: "12345678000190",
      trade_name: "Advogados Associados Demo",
      business_name: "Sociedade de Advogados Demo LTDA",
      contact_name: "João Demonstração",
      address_id: companyAddress.id,
      whatsapp: "11977777777",
      mobile_phone: "11977777777",
      landline_phone: "1130303030",
      email: "demo@advancemais.com",
      password: companyPassword,
      role_id: companyRole.id,
      status: 1,
    },
  });

  // Buscar plano inicial
  const initialPlan = await prisma.subscriptionPlan.findFirst({
    where: { name: "Inicial" },
  });

  if (!initialPlan) {
    throw new Error("Plano inicial não encontrado");
  }

  // Criar assinatura ativa para a empresa demo
  await prisma.companySubscription.upsert({
    where: { id: "demo-subscription" },
    update: {},
    create: {
      id: "demo-subscription",
      company_id: companyDemo.id,
      plan_id: initialPlan.id,
      status: "active",
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias a partir de hoje
      next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      payment_method_id: "credit_card",
      frequency: "monthly",
      frequency_type: "months",
      auto_recurring: true,
      external_id: "demo-external-id",
    },
  });

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro durante a execução do seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
