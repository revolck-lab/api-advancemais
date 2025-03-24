import { config } from "@shared/config/env";
import { logger } from "@shared/utils/logger";
import dotenv from "dotenv";
/**
 * Script para depuração e teste do serviço de email
 *
 * Executar: npm run debug:email
 */
// Garantir que as variáveis de ambiente estejam disponíveis
dotenv.config();

// Tentar importar o módulo brevo de várias maneiras possíveis
let brevo: any;
try {
  // Método de importação 1: importação padrão
  brevo = require("@getbrevo/brevo");
  logger.info("✅ Importação do módulo brevo realizada utilizando require");
} catch (error) {
  logger.error("❌ Erro ao importar módulo via require:", error);

  try {
    // Método alternativo de importação
    import("@getbrevo/brevo")
      .then((module) => {
        brevo = module;
        logger.info(
          "✅ Importação do módulo brevo realizada utilizando import dinâmico"
        );
      })
      .catch((err) => {
        logger.error("❌ Erro ao importar módulo via import dinâmico:", err);
      });
  } catch (importError) {
    logger.error("❌ Todos os métodos de importação falharam");
  }
}

/**
 * Examina e registra a estrutura do objeto
 */
function inspectObject(
  obj: any,
  name: string,
  depth: number = 0,
  maxDepth: number = 2
) {
  if (depth > maxDepth) return;

  logger.info(`Inspecionando objeto ${name}:`);

  if (!obj) {
    logger.info(`${name} é ${obj}`);
    return;
  }

  if (typeof obj === "function") {
    logger.info(`${name} é uma função`);
    return;
  }

  // Verificar propriedades próprias
  const props = Object.getOwnPropertyNames(obj);
  logger.info(`Propriedades próprias de ${name}: ${props.join(", ")}`);

  // Verificar propriedades enumeráveis
  try {
    logger.info(
      `Propriedades enumeráveis de ${name}: ${Object.keys(obj).join(", ")}`
    );
  } catch (error) {
    logger.info(`Erro ao acessar propriedades enumeráveis de ${name}`);
  }

  // Se for um protótipo, verificar métodos
  if (depth === 0) {
    try {
      const proto = Object.getPrototypeOf(obj);
      if (proto) {
        inspectObject(proto, `${name}.prototype`, depth + 1, maxDepth);
      }
    } catch (error) {
      logger.info(`Erro ao acessar prototype de ${name}`);
    }
  }
}

/**
 * Testa a importação do módulo Brevo
 */
function testBrevoImport() {
  logger.info("=== Testando importação do módulo @getbrevo/brevo ===");

  // Verificar se o módulo foi importado corretamente
  if (!brevo) {
    logger.error("❌ Módulo brevo não foi importado");
    // Verificar se o módulo está instalado
    try {
      const packageJson = require("@getbrevo/brevo/package.json");
      logger.info(
        `Módulo @getbrevo/brevo está instalado (versão: ${packageJson.version})`
      );
    } catch (error) {
      logger.error("❌ Módulo @getbrevo/brevo não parece estar instalado");
      logger.error(
        "Execute 'npm install @getbrevo/brevo' para instalar o módulo"
      );
      return false;
    }
    return false;
  }

  // Analisar a estrutura do objeto brevo
  inspectObject(brevo, "brevo");

  // Verificar se a classe ou construtor TransactionalEmailsApi existe
  let apiConstructor = null;

  // Tentar encontrar a classe de várias maneiras possíveis
  if (typeof brevo.TransactionalEmailsApi === "function") {
    logger.info("✅ brevo.TransactionalEmailsApi é uma função/construtor");
    apiConstructor = brevo.TransactionalEmailsApi;
  } else if (
    brevo.default &&
    typeof brevo.default.TransactionalEmailsApi === "function"
  ) {
    logger.info(
      "✅ brevo.default.TransactionalEmailsApi é uma função/construtor"
    );
    apiConstructor = brevo.default.TransactionalEmailsApi;
  } else {
    // Verificar toda a estrutura para encontrar a TransactionalEmailsApi
    logger.info(
      "⚠️ TransactionalEmailsApi não encontrada nos locais esperados"
    );
    logger.info("Realizando busca completa no objeto brevo...");

    // Função recursiva para encontrar a classe
    function findClass(obj: any, path: string = ""): string | null {
      if (!obj || typeof obj !== "object") return null;

      for (const key of Object.keys(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        if (
          key === "TransactionalEmailsApi" &&
          typeof obj[key] === "function"
        ) {
          return currentPath;
        }

        if (typeof obj[key] === "object" && obj[key] !== null) {
          const result = findClass(obj[key], currentPath);
          if (result) return result;
        }
      }

      return null;
    }

    const apiPath = findClass(brevo);
    if (apiPath) {
      logger.info(`✅ TransactionalEmailsApi encontrada em: brevo.${apiPath}`);
      // Obter o construtor de forma dinâmica
      let current = brevo;
      for (const part of apiPath.split(".")) {
        current = current[part];
      }
      apiConstructor = current;
    } else {
      logger.error(
        "❌ TransactionalEmailsApi não encontrada em nenhum lugar do objeto brevo"
      );

      // Mostrar todas as exportações disponíveis
      logger.info("Exportações disponíveis no módulo brevo:");
      function logKeys(obj: any, prefix: string = "") {
        if (!obj || typeof obj !== "object") return;

        for (const key of Object.keys(obj)) {
          const currentPath = prefix ? `${prefix}.${key}` : key;
          logger.info(`- ${currentPath} (${typeof obj[key]})`);

          if (typeof obj[key] === "object" && obj[key] !== null) {
            logKeys(obj[key], currentPath);
          }
        }
      }

      logKeys(brevo);
      return false;
    }
  }

  // Tentar instanciar a API
  try {
    const apiInstance = new apiConstructor();
    logger.info("✅ API instanciada com sucesso");

    // Inspecionar os métodos disponíveis na instância
    inspectObject(apiInstance, "apiInstance");

    // Verificar se os métodos necessários existem
    if (typeof apiInstance.setApiKey !== "function") {
      logger.error("❌ apiInstance.setApiKey não é uma função");
      logger.info("Buscando outros métodos para definir a chave API...");

      // Procurar método alternativo para definir a API key
      const methods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(apiInstance)
      );
      logger.info(`Métodos disponíveis: ${methods.join(", ")}`);

      const possibleMethods = methods.filter(
        (m) =>
          m.toLowerCase().includes("api") && m.toLowerCase().includes("key")
      );

      if (possibleMethods.length > 0) {
        logger.info(
          `Métodos que podem ser usados para configurar a API key: ${possibleMethods.join(
            ", "
          )}`
        );
      }

      // Verificar se existe alguma propriedade de autenticação
      if (apiInstance.authentications) {
        logger.info("✅ apiInstance.authentications existe");
        logger.info(
          `Autenticações disponíveis: ${Object.keys(
            apiInstance.authentications
          ).join(", ")}`
        );
      }

      return false;
    }

    // Verificar SendSmtpEmail
    let sendSmtpEmailConstructor = null;
    if (typeof brevo.SendSmtpEmail === "function") {
      sendSmtpEmailConstructor = brevo.SendSmtpEmail;
      logger.info("✅ brevo.SendSmtpEmail é uma função/construtor");
    } else if (
      brevo.default &&
      typeof brevo.default.SendSmtpEmail === "function"
    ) {
      sendSmtpEmailConstructor = brevo.default.SendSmtpEmail;
      logger.info("✅ brevo.default.SendSmtpEmail é uma função/construtor");
    } else {
      logger.error("❌ Não foi possível encontrar o construtor SendSmtpEmail");
      return false;
    }

    // Testar criação de objeto SendSmtpEmail
    try {
      const sendSmtpEmail = new sendSmtpEmailConstructor();
      logger.info("✅ SendSmtpEmail instanciado com sucesso");

      // Testar definição de propriedades
      sendSmtpEmail.subject = "Teste";
      sendSmtpEmail.htmlContent = "<p>Teste</p>";
      sendSmtpEmail.to = [{ email: "test@example.com" }];

      logger.info("✅ Propriedades definidas com sucesso");
    } catch (error) {
      logger.error("❌ Erro ao instanciar ou configurar SendSmtpEmail:", error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error("❌ Erro ao instanciar a TransactionalEmailsApi:", error);
    return false;
  }
}

/**
 * Verifica a configuração do Brevo
 */
function checkBrevoConfig() {
  logger.info("=== Verificando configuração do Brevo ===");

  if (!config.BREVO_API_KEY) {
    logger.error("❌ BREVO_API_KEY não está definida");
    return false;
  }

  logger.info("✅ BREVO_API_KEY está definida");
  logger.info(`✅ EMAIL_FROM: ${config.EMAIL_FROM}`);
  logger.info(`✅ EMAIL_FROM_NAME: ${config.EMAIL_FROM_NAME}`);
  logger.info(`✅ EMAIL_REPLY_TO: ${config.EMAIL_REPLY_TO}`);

  return true;
}

/**
 * Testa o envio de um email básico
 */
async function testSendEmail() {
  logger.info("=== Testando envio de email básico ===");

  if (!brevo) {
    logger.error("❌ Módulo brevo não disponível para teste de envio");
    return false;
  }

  try {
    // Determinar as classes corretas a serem usadas
    const ApiClass =
      brevo.TransactionalEmailsApi ||
      (brevo.default && brevo.default.TransactionalEmailsApi);

    const SendEmailClass =
      brevo.SendSmtpEmail || (brevo.default && brevo.default.SendSmtpEmail);

    const ApiKeysEnum =
      brevo.TransactionalEmailsApiApiKeys ||
      (brevo.default && brevo.default.TransactionalEmailsApiApiKeys);

    if (!ApiClass) {
      logger.error(
        "❌ Não foi possível encontrar a classe TransactionalEmailsApi"
      );
      return false;
    }

    if (!SendEmailClass) {
      logger.error("❌ Não foi possível encontrar a classe SendSmtpEmail");
      return false;
    }

    // Inicializar o cliente Brevo
    const apiInstance = new ApiClass();

    // Configurar autenticação usando o método encontrado
    if (typeof apiInstance.setApiKey === "function") {
      // Se tiver o enum de API keys, use-o
      if (ApiKeysEnum && ApiKeysEnum.apiKey) {
        apiInstance.setApiKey(
          ApiKeysEnum.apiKey,
          config.BREVO_API_KEY as string
        );
      } else {
        // Caso contrário, tente o valor direto
        apiInstance.setApiKey("api-key", config.BREVO_API_KEY as string);
      }
    } else if (
      apiInstance.authentications &&
      apiInstance.authentications["api-key"]
    ) {
      // Alternativa: definir diretamente na autenticação
      apiInstance.authentications["api-key"].apiKey = config.BREVO_API_KEY;
    } else {
      logger.error("❌ Não foi possível configurar a API key");
      return false;
    }

    // Criar objeto de email
    const sendSmtpEmail = new SendEmailClass();

    // Definir destinatário
    const testEmail = process.argv[2] || "teste@exemplo.com";
    sendSmtpEmail.to = [{ email: testEmail }];

    // Configurar remetente
    sendSmtpEmail.sender = {
      email: config.EMAIL_FROM || "noreply@advancemais.com.br",
      name: config.EMAIL_FROM_NAME || "AdvanceMais",
    };

    // Configurar responder para
    sendSmtpEmail.replyTo = {
      email: config.EMAIL_REPLY_TO || "suporte@advancemais.com.br",
      name: config.EMAIL_FROM_NAME || "AdvanceMais",
    };

    // Configurar conteúdo
    sendSmtpEmail.subject = "Teste de Email - Debug Script";
    sendSmtpEmail.htmlContent = `
      <html>
        <body>
          <h1>Teste de Email - Debug Script</h1>
          <p>Este é um email de teste enviado pelo script de depuração.</p>
          <p>Se você está visualizando este email, significa que a configuração do serviço de email está funcionando corretamente.</p>
          <hr>
          <p>Data e hora do envio: ${new Date().toLocaleString()}</p>
          <p>Ambiente: ${process.env.NODE_ENV || "desenvolvimento"}</p>
        </body>
      </html>
    `;

    sendSmtpEmail.textContent =
      "Este é um email de teste enviado pelo script de depuração. Se você está visualizando este email, significa que a configuração do serviço de email está funcionando corretamente.";

    logger.info(`📧 Tentando enviar email para ${testEmail}...`);

    // Verificar se o método sendTransacEmail existe
    if (typeof apiInstance.sendTransacEmail !== "function") {
      logger.error(
        "❌ Método sendTransacEmail não encontrado na instância API"
      );

      // Listar métodos disponíveis
      const methods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(apiInstance)
      ).filter((m) => typeof apiInstance[m] === "function");

      logger.info(`Métodos disponíveis: ${methods.join(", ")}`);

      // Procurar por métodos semelhantes
      const possibleMethods = methods.filter(
        (m) =>
          m.toLowerCase().includes("send") || m.toLowerCase().includes("email")
      );

      if (possibleMethods.length > 0) {
        logger.info(
          `Métodos que podem ser usados para enviar email: ${possibleMethods.join(
            ", "
          )}`
        );
      }

      return false;
    }

    // Enviar email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    logger.info(`✅ Email enviado com sucesso! Resultado:`, result);
    return true;
  } catch (error) {
    logger.error("❌ Erro ao enviar email:", error);
    return false;
  }
}

/**
 * Função principal de diagnóstico
 */
async function runEmailDiagnostic() {
  logger.info("=== Iniciando diagnóstico do serviço de email ===");

  // Verificar a versão do Node.js
  logger.info(`Node.js versão: ${process.version}`);

  // Testar importação do módulo
  const importSuccess = testBrevoImport();
  if (!importSuccess) {
    logger.error(
      "❌ Falha na importação do módulo brevo. Abortando diagnóstico."
    );
    return false;
  }

  // Verificar configuração
  const configSuccess = checkBrevoConfig();
  if (!configSuccess) {
    logger.error("❌ Falha na configuração do Brevo. Abortando diagnóstico.");
    return false;
  }

  // Testar envio de email
  const sendSuccess = await testSendEmail();
  if (!sendSuccess) {
    logger.error("❌ Falha no envio de email de teste.");
    return false;
  }

  logger.info("✅ Diagnóstico do serviço de email concluído com sucesso!");
  return true;
}

// Executar diagnóstico
runEmailDiagnostic()
  .then((success) => {
    if (success) {
      console.log("✅ Diagnóstico do serviço de email concluído com sucesso!");
    } else {
      console.error("❌ Diagnóstico do serviço de email falhou.");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("Erro durante diagnóstico:", error);
    process.exit(1);
  });
