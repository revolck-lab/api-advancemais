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
  const adminAddress = await prisma.address.create({
    data: {
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
