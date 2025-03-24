import { mailConfig } from "@shared/config/mail";
import { logger } from "@shared/utils/logger";

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
 * Classe para envio de emails utilizando a API Brevo
 */
export class EmailService {
  private apiInstance: any = null;
  private initialized: boolean = false;
  private brewoLoaded: boolean = false;

  constructor() {
    this.initialized = this.initialize();
  }

  /**
   * Inicializa o serviço de email
   */
  private initialize(): boolean {
    if (!mailConfig.brevo.isConfigured) {
      logger.warn(
        "Serviço de email não configurado. Emails não serão enviados."
      );
      return false;
    }

    // Verificar se o módulo brevo foi importado
    if (!brevo) {
      logger.error(
        "Módulo @getbrevo/brevo não disponível. Verifique a instalação."
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
  async sendEmail(
    options: SendEmailOptions
  ): Promise<{ success: boolean; messageId?: string; error?: any }> {
    if (!this.initialized || !this.apiInstance) {
      logger.warn("Tentativa de envio de email com serviço não inicializado");

      // Tentar inicializar novamente
      if (this.brewoLoaded) {
        this.initialized = this.initialize();

        // Se ainda falhou, retornar erro
        if (!this.initialized) {
          return { success: false, error: "Serviço de email não inicializado" };
        }
      } else {
        return { success: false, error: "Módulo brevo não disponível" };
      }
    }

    try {
      // Determinar a classe correta a ser usada
      const SendEmailClass =
        brevo.SendSmtpEmail || (brevo.default && brevo.default.SendSmtpEmail);

      if (!SendEmailClass) {
        logger.error("Classe SendSmtpEmail não encontrada no módulo brevo");
        return { success: false, error: "Classe SendSmtpEmail não disponível" };
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
        logger.error("Método sendTransacEmail não disponível na instância API");
        return { success: false, error: "Método de envio não disponível" };
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
    } catch (error) {
      logger.error("Erro ao enviar email:", error);
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * Envia um email de teste simples
   */
  async sendTestEmail(
    to: string
  ): Promise<{ success: boolean; messageId?: string; error?: any }> {
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
   * Reinicializa o serviço
   */
  reinitialize(): boolean {
    return this.initialize();
  }
}

// Exporta uma instância única do serviço de email
export const emailService = new EmailService();
