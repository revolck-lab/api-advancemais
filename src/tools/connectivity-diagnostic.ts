import { logger } from "@shared/utils/logger";
import { config } from "@shared/config/env";
import https from "https";
import http from "http";
import { URL } from "url";

/**
 * Script para diagnóstico de conectividade com serviços externos
 *
 * Executar: npx ts-node -r tsconfig-paths/register src/tools/connectivity-diagnostic.ts
 */
// Serviços para verificar
const servicesToCheck = [
  {
    name: "Brevo API",
    url: "https://api.brevo.com/v3/swagger.json",
    isConfigured: !!config.BREVO_API_KEY,
  },
  {
    name: "Mercado Pago API",
    url: "https://api.mercadopago.com/v1/payment_methods",
    isConfigured: !!config.MERCADOPAGO_ACCESS_TOKEN,
  },
  {
    name: "Google DNS (conectividade básica)",
    url: "https://8.8.8.8/",
  },
  {
    name: "Cloudflare DNS (conectividade básica)",
    url: "https://1.1.1.1/",
  },
];

/**
 * Verifica a conectividade com um endpoint
 */
async function checkConnectivity(service: {
  name: string;
  url: string;
  isConfigured?: boolean;
}): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (service.isConfigured === false) {
        logger.warn(
          `Serviço ${service.name} não está configurado, pulando verificação`
        );
        resolve(false);
        return;
      }

      const url = new URL(service.url);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: "GET",
        timeout: 5000,
      };

      const protocol = url.protocol === "https:" ? https : http;

      const req = protocol.request(options, (res) => {
        const statusCode = res.statusCode || 0;

        if (statusCode >= 200 && statusCode < 300) {
          logger.info(
            `✅ Conectividade com ${service.name} OK (${statusCode})`
          );
          resolve(true);
        } else {
          logger.error(
            `❌ Falha na conexão com ${service.name}: HTTP ${statusCode}`
          );
          resolve(false);
        }

        // Consumir a resposta
        res.resume();
      });

      req.on("error", (e) => {
        logger.error(`❌ Erro ao conectar com ${service.name}: ${e.message}`);
        resolve(false);
      });

      req.on("timeout", () => {
        logger.error(`❌ Timeout ao conectar com ${service.name}`);
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch (error) {
      logger.error(`❌ Exceção ao verificar ${service.name}: ${error}`);
      resolve(false);
    }
  });
}

/**
 * Verifica a conectividade com módulos instalados
 */
function checkModules(): void {
  const modulesToCheck = [
    "@getbrevo/brevo",
    "mercadopago",
    "express",
    "prisma",
  ];

  for (const moduleName of modulesToCheck) {
    try {
      require(moduleName);
      logger.info(`✅ Módulo ${moduleName} carregado com sucesso`);
    } catch (error) {
      logger.error(`❌ Falha ao carregar módulo ${moduleName}: ${error}`);
    }
  }
}

/**
 * Função principal de diagnóstico
 */
async function runDiagnostic(): Promise<void> {
  logger.info("=== Iniciando diagnóstico de conectividade ===");

  logger.info("--- Verificando módulos ---");
  checkModules();

  logger.info("--- Verificando variáveis de ambiente ---");
  logger.info(`NODE_ENV: ${config.NODE_ENV}`);
  logger.info(`DATABASE_URL configurada: ${!!config.DATABASE_URL}`);
  logger.info(`BREVO_API_KEY configurada: ${!!config.BREVO_API_KEY}`);
  logger.info(
    `MERCADOPAGO_ACCESS_TOKEN configurada: ${!!config.MERCADOPAGO_ACCESS_TOKEN}`
  );

  logger.info("--- Verificando conectividade com serviços ---");

  const results = await Promise.all(
    servicesToCheck.map((service) => checkConnectivity(service))
  );

  const successCount = results.filter(Boolean).length;
  const totalServices = servicesToCheck.length;

  logger.info("=== Resultado do diagnóstico ===");
  logger.info(`${successCount} de ${totalServices} serviços estão acessíveis`);

  if (successCount < totalServices) {
    logger.warn(
      "⚠️ Alguns serviços não estão acessíveis. Verifique sua conexão ou configurações."
    );
  } else {
    logger.info("✅ Todos os serviços estão acessíveis!");
  }
}

// Executar diagnóstico
runDiagnostic()
  .then(() => {
    console.log("Diagnóstico concluído.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erro durante diagnóstico:", error);
    process.exit(1);
  });
