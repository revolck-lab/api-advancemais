import { mailConfig } from "@shared/config/mail";
import { logger } from "@shared/utils/logger";
import brevo from "@getbrevo/brevo";

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
  private apiInstance: brevo.TransactionalEmailsApi | null = null;
  private initialized: boolean = false;

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

    try {
      // Inicializar o cliente Brevo
      const apiInstance = new brevo.TransactionalEmailsApi();

      // Configurar autenticação usando método público
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, mailConfig.brevo.apiKey as string);

      this.apiInstance = apiInstance;

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
      return { success: false, error: "Serviço de email não inicializado" };
    }

    try {
      // Criar objeto de email para Brevo
      const sendSmtpEmail = new brevo.SendSmtpEmail();

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
}

// Exporta uma instância única do serviço de email
export const emailService = new EmailService();
