declare module "@getbrevo/brevo" {
  // Declare a classe TransactionalEmailsApi
  export class TransactionalEmailsApi {
    constructor();

    // Método para enviar email transacional
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<any>;

    // Método público para definir a chave API
    setApiKey(key: string, value: string): void;
  }

  // Enumerar as chaves API disponíveis
  export enum TransactionalEmailsApiApiKeys {
    apiKey = "api-key",
    partnerKey = "partner-key",
  }

  // Declare a classe SendSmtpEmail
  export class SendSmtpEmail {
    to?: Array<{ email: string; name?: string }>;
    cc?: Array<{ email: string; name?: string }>;
    bcc?: Array<{ email: string; name?: string }>;
    sender?: { email: string; name?: string };
    replyTo?: { email: string; name?: string };
    subject?: string;
    htmlContent?: string;
    textContent?: string;
    templateId?: number;
    params?: Record<string, any>;
    attachment?: Array<{ name: string; content: string; contentType: string }>;
  }

  // Declare outras classes ou interfaces que você possa precisar
  export interface Authentication {
    // Propriedades de autenticação
  }

  export interface ApiKeyAuth extends Authentication {
    apiKey?: string;
  }
}
