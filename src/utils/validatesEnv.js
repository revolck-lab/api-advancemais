const validateEnvVariables = async (envVars = []) => {
  const defaultRequiredEnvVariables = [
    "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_DATABASE", "DB_PORT",
    "JWT_SECRET",
    "PORT",
    "SMTP_HOST", "SMTP_PASS", "SMTP_PORT", "SMTP_USER",
  ];

  const requiredEnvVariables = envVars.length
    ? envVars
    : defaultRequiredEnvVariables;

  const missingVars = requiredEnvVariables.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    return {
      success: false,
      message: `The following environment variables are missing: ${missingVars.join(
        ", "
      )}`,
    };
  }

  return { success: true, message: "All environment variables are set." };
};

module.exports = validateEnvVariables;
