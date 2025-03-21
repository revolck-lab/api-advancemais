/**
 * Valida as variáveis de ambiente necessárias
 * @returns Objeto com informações sobre variáveis ausentes
 */
export const validateEnv = (): { valid: boolean; missing: string[] } => {
  const requiredVars = ["NODE_ENV", "PORT", "DATABASE_URL", "JWT_SECRET"];

  const missing: string[] = [];

  // Verificar variáveis obrigatórias
  for (const envVar of requiredVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Carrega valores padrão para variáveis de ambiente não definidas
 */
export const loadDefaultEnv = (): void => {
  process.env.NODE_ENV = process.env.NODE_ENV || "development";
  process.env.PORT = process.env.PORT || "3000";
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "*";
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
  process.env.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || "10";
  process.env.LOG_LEVEL = process.env.LOG_LEVEL || "info";
  process.env.RATE_LIMIT_WINDOW_MS =
    process.env.RATE_LIMIT_WINDOW_MS || "900000";
  process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || "100";
  process.env.ALLOW_NO_DB_MODE = process.env.ALLOW_NO_DB_MODE || "false";
};

/**
 * Inicializa as variáveis de ambiente
 * @returns true se todas as variáveis obrigatórias estiverem presentes
 */
export const initEnv = (): boolean => {
  // Carregar valores padrão
  loadDefaultEnv();

  // Validar variáveis de ambiente
  const { valid, missing } = validateEnv();

  if (!valid) {
    console.error("❌ Variáveis de ambiente obrigatórias não definidas:");
    missing.forEach((envVar) => console.error(`   - ${envVar}`));

    // Verificar se podemos continuar sem banco de dados
    const allowNoDb = process.env.ALLOW_NO_DB_MODE === "true";
    const onlyMissingDb = missing.length === 1 && missing[0] === "DATABASE_URL";

    if (allowNoDb && onlyMissingDb) {
      console.warn(
        "⚠️ Modo sem banco de dados ativado - alguns recursos estarão indisponíveis"
      );
      return true;
    }

    return false;
  }

  return true;
};

// Configurações centralizadas da aplicação
export const config = {
  // Ambiente
  env: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",

  // Servidor
  port: parseInt(process.env.PORT || "3000", 10),

  // Database
  databaseUrl: process.env.DATABASE_URL,
  allowNoDbMode: process.env.ALLOW_NO_DB_MODE === "true",

  // Segurança
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || "*",

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
};
