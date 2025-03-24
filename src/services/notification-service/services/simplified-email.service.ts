import { mailConfig } from "@shared/config/mail";
import { logger } from "@shared/utils/logger";

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
 * Serviço de email simplificado e robusto
 */
export class SimplifiedEmailService {
  private brevo: any = null;
  private apiInstance: any = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Inicializa o serviço de email
   */
  private initialize(): boolean {
    // Verificar se a API key está configurada
    if (!mailConfig.brevo.apiKey) {
      logger.warn(
        "Chave de API do Brevo não configurada. Emails não serão enviados."
      );
      return false;
    }

    try {
      // Importar o módulo brevo usando require para evitar problemas
      this.brevo = require("@getbrevo/brevo");

      if (!this.brevo) {
        logger.error("Erro ao importar módulo @getbrevo/brevo");
        return false;
      }

      // Verificar se a classe TransactionalEmailsApi existe
      const ApiClass = this.findTransactionalEmailsApi();

      if (!ApiClass) {
        logger.error(
          "API de email transacional não encontrada no módulo brevo"
        );
        return false;
      }

      // Criar instância da API
      this.apiInstance = new ApiClass();

      // Configurar API key
      if (!this.configureApiKey()) {
        logger.error("Falha ao configurar API key");
        return false;
      }

      logger.info("Serviço de email inicializado com sucesso");
      this.initialized = true;
      return true;
    } catch (error) {
      logger.error("Erro ao inicializar serviço de email:", error);
      return false;
    }
  }

  /**
   * Encontra a classe TransactionalEmailsApi no módulo brevo
   */
  private findTransactionalEmailsApi(): any {
    // Verificar se a classe está disponível diretamente
    if (typeof this.brevo.TransactionalEmailsApi === "function") {
      return this.brevo.TransactionalEmailsApi;
    }

    // Verificar se está dentro de default (ES module)
    if (
      this.brevo.default &&
      typeof this.brevo.default.TransactionalEmailsApi === "function"
    ) {
      return this.brevo.default.TransactionalEmailsApi;
    }

    // Buscar em todas as propriedades
    for (const key in this.brevo) {
      if (
        typeof this.brevo[key] === "function" &&
        (key.includes("Email") || key.includes("Mail") || key.includes("Api"))
      ) {
        logger.info(`Classe potencial encontrada: ${key}`);
        return this.brevo[key];
      }
    }

    return null;
  }

  /**
   * Encontra a classe SendSmtpEmail no módulo brevo
   */
  private findSendSmtpEmailClass(): any {
    // Verificar se a classe está disponível diretamente
    if (typeof this.brevo.SendSmtpEmail === "function") {
      return this.brevo.SendSmtpEmail;
    }

    // Verificar se está dentro de default (ES module)
    if (
      this.brevo.default &&
      typeof this.brevo.default.SendSmtpEmail === "function"
    ) {
      return this.brevo.default.SendSmtpEmail;
    }

    // Buscar em todas as propriedades
    for (const key in this.brevo) {
      if (
        typeof this.brevo[key] === "function" &&
        (key.includes("SendSmtp") ||
          key.includes("Email") ||
          key.includes("Mail"))
      ) {
        logger.info(`Classe potencial para email encontrada: ${key}`);
        return this.brevo[key];
      }
    }

    return null;
  }

  /**
   * Configura a API key na instância
   */
  private configureApiKey(): boolean {
    try {
      // Verificar se o método setApiKey existe
      if (typeof this.apiInstance.setApiKey === "function") {
        // Verificar se o enum existe
        if (
          this.brevo.TransactionalEmailsApiApiKeys &&
          this.brevo.TransactionalEmailsApiApiKeys.apiKey
        ) {
          this.apiInstance.setApiKey(
            this.brevo.TransactionalEmailsApiApiKeys.apiKey,
            mailConfig.brevo.apiKey as string
          );
        } else if (
          this.brevo.default &&
          this.brevo.default.TransactionalEmailsApiApiKeys &&
          this.brevo.default.TransactionalEmailsApiApiKeys.apiKey
        ) {
          this.apiInstance.setApiKey(
            this.brevo.default.TransactionalEmailsApiApiKeys.apiKey,
            mailConfig.brevo.apiKey as string
          );
        } else {
          // Tentar valor padrão
          this.apiInstance.setApiKey(
            "api-key",
            mailConfig.brevo.apiKey as string
          );
        }
        return true;
      }

      // Alternativa: verificar se a autenticação está disponível
      if (
        this.apiInstance.authentications &&
        this.apiInstance.authentications["api-key"]
      ) {
        this.apiInstance.authentications["api-key"].apiKey =
          mailConfig.brevo.apiKey;
        return true;
      }

      // Segunda alternativa: verificar se o cliente pode ser configurado diretamente
      if (
        this.apiInstance.apiClient &&
        this.apiInstance.apiClient.authentications &&
        this.apiInstance.apiClient.authentications["api-key"]
      ) {
        this.apiInstance.apiClient.authentications["api-key"].apiKey =
          mailConfig.brevo.apiKey;
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Erro ao configurar API key:", error);
      return false;
    }
  }

  /**
   * Envia um email utilizando a API Brevo
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailResponse> {
    // Verificar se o serviço está inicializado
    if (!this.initialized || !this.apiInstance) {
      return {
        success: false,
        error: "Serviço de email não inicializado",
      };
    }

    try {
      // Obter a classe para criar o objeto de email
      const SendEmailClass = this.findSendSmtpEmailClass();

      if (!SendEmailClass) {
        return {
          success: false,
          error: "Classe para criação de email não encontrada",
        };
      }

      // Criar objeto de email
      const sendSmtpEmail = new SendEmailClass();

      // Configurar destinatários
      sendSmtpEmail.to = options.to.map((r) => ({
        email: r.email,
        name: r.name,
      }));

      // Configurar CC e BCC se existirem
      if (options.cc && options.cc.length > 0) {
        sendSmtpEmail.cc = options.cc.map((r) => ({
          email: r.email,
          name: r.name,
        }));
      }

      if (options.bcc && options.bcc.length > 0) {
        sendSmtpEmail.bcc = options.bcc.map((r) => ({
          email: r.email,
          name: r.name,
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

      // Verificar se o método sendTransacEmail existe
      if (typeof this.apiInstance.sendTransacEmail !== "function") {
        return {
          success: false,
          error: "Método de envio de email não disponível",
        };
      }

      // Enviar email
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);

      logger.info(
        `Email enviado com sucesso para ${options.to
          .map((r) => r.email)
          .join(", ")}`
      );

      return {
        success: true,
        messageId: result && result.messageId ? result.messageId : undefined,
      };
    } catch (error) {
      logger.error("Erro ao enviar email:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Envia um email de teste simples
   */
  async sendTestEmail(to: string): Promise<EmailResponse> {
    const testHtml = `
      <html>
        <body>
          <h1>Teste de Email - AdvanceMais</h1>
          <p>Este é um email de teste enviado através da API.</p>
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
          "Este é um email de teste. Se você está visualizando este email, significa que a configuração do serviço de email está funcionando corretamente.",
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
   * Reinicializa o serviço
   */
  reinitialize(): boolean {
    this.initialized = false;
    this.apiInstance = null;
    return this.initialize();
  }
}

// Exporta uma instância única do serviço de email
export const simplifiedEmailService = new SimplifiedEmailService();
