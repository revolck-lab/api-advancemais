declare module "@getbrevo/brevo" {
  // Enum para chaves de API
  export enum TransactionalEmailsApiApiKeys {
    apiKey = "api-key",
    partnerKey = "partner-key",
  }

  // Configurações da API
  export interface Configuration {
    apiKey?:
      | string
      | Promise<string>
      | ((name: string) => string)
      | ((name: string) => Promise<string>);
    username?: string;
    password?: string;
    accessToken?:
      | string
      | Promise<string>
      | ((name?: string, scopes?: string[]) => string)
      | ((name?: string, scopes?: string[]) => Promise<string>);
    basePath?: string;
    baseOptions?: any;
  }

  // Interface para Cliente API
  export interface ApiClient {
    instance: any;
    authentications: Record<string, any>;
    buildRequest: (options: any) => any;
  }

  // Classe SendSmtpEmail para criação de emails
  export class SendSmtpEmail {
    constructor();
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

  // API de emails transacionais
  export class TransactionalEmailsApi {
    constructor(apiClient?: ApiClient);
    setApiKey(key: string, value: string): void;
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<any>;
    getSmtpTemplates(): Promise<any>;
    getEmailEventReport(opts?: any): Promise<any>;
    getTransacBlockedContacts(): Promise<any>;
    getTransacEmailContent(uuid: string): Promise<any>;
    getTransacEmailsList(opts?: any): Promise<any>;
  }

  // Exportações relacionadas a contatos
  export class ContactsApi {
    constructor(apiClient?: ApiClient);
    addContactToList(listId: number, contactEmails: any): Promise<any>;
    createContact(createContact: any): Promise<any>;
    deleteContact(identifier: string): Promise<any>;
    getContactInfo(identifier: string): Promise<any>;
  }

  // API para listas
  export class ListsApi {
    constructor(apiClient?: ApiClient);
    createList(createList: any): Promise<any>;
    getLists(): Promise<any>;
    getContactsFromList(listId: number, opts?: any): Promise<any>;
  }

  // Exportações padrão
  export const ApiClient: any;
  export const AccountAPI: any;
}
