import { mailConfig } from "@shared/config/mail";
import { logger } from "@shared/utils/logger";
import { ErrorHandler } from "@shared/utils/error-handler";

// Importar brevo usando require para evitar problemas de importação
let brevo: any;
try {
  brevo = require("@getbrevo/brevo");
} catch (error) {
  logger.error("Erro ao importar módulo @getbrevo/brevo:", error);
}

/**
 * Interface para os destinatários de email
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Interface para o conteúdo do email
 */
export interface EmailContent {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

/**
 * Interface para as opções de envio de email
 */
export interface SendEmailOptions {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  from?: EmailRecipient;
  replyTo?: EmailRecipient;
  content: EmailContent;
  templateId?: number;
  templateParams?: Record<string, any>;
  attachments?: Array<{
    name: string;
    content: string; // Base64 encoded
    contentType: string;
  }>;
}

/**
 * Resposta do serviço de email
 */
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: any;
}

/**
 * Serviço de email aprimorado com tratamento de erros e fallback
 */
export class EnhancedEmailService {
  private apiInstance: any = null;
  private initialized: boolean = false;
  private initializationAttempts: number = 0;
  private readonly MAX_INITIALIZATION_ATTEMPTS = 3;
  private brewoLoaded: boolean = false;

  constructor() {
    this.initializeService();
  }

  /**
   * Inicializa o serviço com tentativas
   */
  private async initializeService(): Promise<void> {
    if (
      this.initialized ||
      this.initializationAttempts >= this.MAX_INITIALIZATION_ATTEMPTS
    ) {
      return;
    }

    this.initializationAttempts++;

    await ErrorHandler.captureAsync(
      async () => {
        this.initialized = await this.initialize();
      },
      {
        context: "Inicialização do serviço de email",
        silent: this.initializationAttempts > 1, // Silencia logs após a primeira tentativa
      }
    );

    // Se falhou na inicialização e ainda há tentativas, agenda nova tentativa
    if (
      !this.initialized &&
      this.initializationAttempts < this.MAX_INITIALIZATION_ATTEMPTS
    ) {
      const delay = Math.pow(2, this.initializationAttempts) * 1000; // Exponential backoff
      logger.info(
        `Agendando nova tentativa de inicialização do serviço de email em ${delay}ms`
      );

      setTimeout(() => {
        this.initializeService();
      }, delay);
    }
  }

  /**
   * Inicializa o serviço de email
   */
  private async initialize(): Promise<boolean> {
    if (!mailConfig.brevo.isConfigured) {
      logger.warn(
        "Serviço de email não configurado. Emails não serão enviados."
      );
      return false;
    }

    // Verificar se o módulo brevo está disponível
    if (!brevo) {
      logger.error(
        "Módulo @getbrevo/brevo não disponível ou incorretamente importado"
      );
      this.brewoLoaded = false;
      return false;
    }

    this.brewoLoaded = true;

    try {
      // Determinar as classes corretas a serem usadas
      const ApiClass =
        brevo.TransactionalEmailsApi ||
        (brevo.default && brevo.default.TransactionalEmailsApi);

      if (!ApiClass) {
        logger.error(
          "Classe TransactionalEmailsApi não encontrada no módulo brevo"
        );
        return false;
      }

      // Inicializar o cliente Brevo
      this.apiInstance = new ApiClass();

      // Configurar autenticação
      const ApiKeysEnum =
        brevo.TransactionalEmailsApiApiKeys ||
        (brevo.default && brevo.default.TransactionalEmailsApiApiKeys);

      if (typeof this.apiInstance.setApiKey === "function") {
        // Se tiver o enum de API keys, use-o
        if (ApiKeysEnum && ApiKeysEnum.apiKey) {
          this.apiInstance.setApiKey(
            ApiKeysEnum.apiKey,
            mailConfig.brevo.apiKey as string
          );
        } else {
          // Caso contrário, tente o valor direto
          this.apiInstance.setApiKey(
            "api-key",
            mailConfig.brevo.apiKey as string
          );
        }
      } else if (
        this.apiInstance.authentications &&
        this.apiInstance.authentications["api-key"]
      ) {
        // Alternativa: definir diretamente na autenticação
        this.apiInstance.authentications["api-key"].apiKey =
          mailConfig.brevo.apiKey;
      } else {
        logger.error("Não foi possível configurar a API key");
        return false;
      }

      logger.info("Serviço de email Brevo inicializado com sucesso.");
      return true;
    } catch (error) {
      logger.error("Erro ao inicializar serviço de email Brevo:", error);
      return false;
    }
  }

  /**
   * Envia um email utilizando a API Brevo
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    // Se o serviço não está inicializado, tenta inicializar novamente
    if (!this.initialized) {
      await this.initializeService();

      // Se ainda não está inicializado, retorna erro
      if (!this.initialized || !this.apiInstance) {
        logger.warn("Tentativa de envio de email com serviço não inicializado");
        return {
          success: false,
          error: "Serviço de email não inicializado",
        };
      }
    }

    // Usar o método captureAsync com um valor de retorno padrão explícito para o caso de erro
    return await ErrorHandler.captureAsync<EmailResponse>(
      async () => {
        // Determinar a classe correta a ser usada
        const SendEmailClass =
          brevo.SendSmtpEmail || (brevo.default && brevo.default.SendSmtpEmail);

        if (!SendEmailClass) {
          logger.error("Classe SendSmtpEmail não encontrada no módulo brevo");
          return {
            success: false,
            error: "Classe SendSmtpEmail não disponível",
          };
        }

        // Criar objeto de email para Brevo
        const sendSmtpEmail = new SendEmailClass();

        // Configurar destinatários
        sendSmtpEmail.to = options.to.map((recipient) => ({
          email: recipient.email,
          name: recipient.name,
        }));

        // Configurar CC se existir
        if (options.cc && options.cc.length > 0) {
          sendSmtpEmail.cc = options.cc.map((recipient) => ({
            email: recipient.email,
            name: recipient.name,
          }));
        }

        // Configurar BCC se existir
        if (options.bcc && options.bcc.length > 0) {
          sendSmtpEmail.bcc = options.bcc.map((recipient) => ({
            email: recipient.email,
            name: recipient.name,
          }));
        }

        // Configurar remetente
        sendSmtpEmail.sender = options.from || {
          email: mailConfig.defaultFrom.email,
          name: mailConfig.defaultFrom.name,
        };

        // Configurar responder para
        sendSmtpEmail.replyTo = options.replyTo || {
          email: mailConfig.defaultReplyTo,
          name: mailConfig.defaultFrom.name,
        };

        // Configurar conteúdo
        sendSmtpEmail.subject = options.content.subject;
        sendSmtpEmail.htmlContent = options.content.htmlContent;

        if (options.content.textContent) {
          sendSmtpEmail.textContent = options.content.textContent;
        }

        // Configurar template se existir
        if (options.templateId) {
          sendSmtpEmail.templateId = options.templateId;

          if (options.templateParams) {
            sendSmtpEmail.params = options.templateParams;
          }
        }

        // Configurar anexos se existirem
        if (options.attachments && options.attachments.length > 0) {
          sendSmtpEmail.attachment = options.attachments.map((attachment) => ({
            name: attachment.name,
            content: attachment.content,
            contentType: attachment.contentType,
          }));
        }

        // Verificar se o método sendTransacEmail existe
        if (typeof this.apiInstance.sendTransacEmail !== "function") {
          logger.error(
            "Método sendTransacEmail não disponível na instância API"
          );
          return {
            success: false,
            error: "Método de envio não disponível",
          };
        }

        // Enviar email
        const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
        logger.info(
          `Email enviado com sucesso para ${options.to
            .map((r) => r.email)
            .join(", ")}`
        );

        // Extrair o messageId do resultado
        const messageId = (result as any).messageId || "";

        return {
          success: true,
          messageId: messageId,
        };
      },
      {
        context: "Envio de email",
        defaultReturn: {
          // Valor padrão explícito que corresponde ao tipo EmailResponse
          success: false,
          error: "Erro ao enviar email",
        },
      }
    );
  }

  /**
   * Envia um email de teste simples
   */
  async sendTestEmail(to: string): Promise<EmailResponse> {
    const testHtml = `
      <html>
        <body>
          <h1>Teste de Email - AdvanceMais</h1>
          <p>Este é um email de teste enviado através da API Brevo.</p>
          <p>Se você está visualizando este email, significa que a configuração do serviço de email está funcionando corretamente.</p>
          <hr>
          <p>Data e hora do envio: ${new Date().toLocaleString()}</p>
          <p>Ambiente: ${process.env.NODE_ENV || "desenvolvimento"}</p>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: [{ email: to }],
      content: {
        subject: "Teste de Email - AdvanceMais",
        htmlContent: testHtml,
        textContent:
          "Este é um email de teste enviado através da API Brevo. Se você está visualizando este email, significa que a configuração do serviço de email está funcionando corretamente.",
      },
    });
  }

  /**
   * Verifica se o serviço está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Força a reinicialização do serviço
   */
  async reinitialize(): Promise<boolean> {
    this.initialized = false;
    this.initializationAttempts = 0;
    await this.initializeService();
    return this.initialized;
  }
}

// Exporta uma instância única do serviço de email
export const enhancedEmailService = new EnhancedEmailService();
