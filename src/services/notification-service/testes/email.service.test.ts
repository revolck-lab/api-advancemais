import { EmailService } from "@services/notification-service/services/email.service";
import * as brevo from "@getbrevo/brevo";

// Mock do módulo brevo
jest.mock("@getbrevo/brevo", () => {
  return {
    TransactionalEmailsApi: jest.fn().mockImplementation(() => ({
      sendTransacEmail: jest
        .fn()
        .mockResolvedValue({ messageId: "mock-message-id" }),
      authentications: {
        "api-key": {
          apiKey: "",
        },
      },
    })),
    SendSmtpEmail: jest.fn().mockImplementation(() => ({})),
  };
});

// Mock do módulo de configuração
jest.mock("@shared/config/mail", () => ({
  mailConfig: {
    brevo: {
      apiKey: "mock-api-key",
      enabled: true,
    },
    defaultFrom: {
      email: "test@example.com",
      name: "Test Sender",
    },
    defaultReplyTo: "reply@example.com",
    templatesDir: "mocked-templates-dir",
    isConfigured: true,
    getTemplateVars: jest.fn().mockReturnValue({
      baseUrl: "http://localhost:3000",
      currentYear: 2025,
      companyName: "AdvanceMais",
      supportEmail: "support@example.com",
      logoUrl: "http://example.com/logo.png",
    }),
    init: jest.fn().mockReturnValue(true),
  },
}));

// Mock do logger
jest.mock("@shared/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("EmailService", () => {
  let emailService: EmailService;

  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Criar uma nova instância do serviço de email para cada teste
    emailService = new EmailService();
  });

  describe("sendEmail", () => {
    it("deve enviar um email com sucesso", async () => {
      // Configurar o mock
      const sendTransacEmailMock = (brevo.TransactionalEmailsApi as jest.Mock)
        .mock.results[0].value.sendTransacEmail;
      sendTransacEmailMock.mockResolvedValueOnce({
        messageId: "test-message-id-123",
      });

      // Executar o método
      const result = await emailService.sendEmail({
        to: [{ email: "recipient@example.com", name: "Test Recipient" }],
        content: {
          subject: "Test Subject",
          htmlContent: "<p>Test content</p>",
          textContent: "Test content",
        },
      });

      // Verificar o resultado
      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-message-id-123");

      // Verificar se o método foi chamado corretamente
      expect(sendTransacEmailMock).toHaveBeenCalledTimes(1);

      // Verificar se o SendSmtpEmail foi construído corretamente
      expect(brevo.SendSmtpEmail).toHaveBeenCalledTimes(1);
    });

    it("deve lidar com erros ao enviar email", async () => {
      // Configurar o mock para lançar um erro
      const sendTransacEmailMock = (brevo.TransactionalEmailsApi as jest.Mock)
        .mock.results[0].value.sendTransacEmail;
      sendTransacEmailMock.mockRejectedValueOnce(new Error("Test error"));

      // Executar o método
      const result = await emailService.sendEmail({
        to: [{ email: "recipient@example.com" }],
        content: {
          subject: "Test Subject",
          htmlContent: "<p>Test content</p>",
        },
      });

      // Verificar o resultado
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
      expect((result.error as Error).message).toBe("Test error");
    });
  });

  describe("sendTestEmail", () => {
    it("deve enviar um email de teste com sucesso", async () => {
      // Fazer um spy do método sendEmail
      const sendEmailSpy = jest.spyOn(emailService, "sendEmail");
      sendEmailSpy.mockResolvedValueOnce({
        success: true,
        messageId: "test-email-123",
      });

      // Executar o método
      const result = await emailService.sendTestEmail("test@example.com");

      // Verificar o resultado
      expect(result.success).toBe(true);
      expect(result.messageId).toBe("test-email-123");

      // Verificar se sendEmail foi chamado corretamente
      expect(sendEmailSpy).toHaveBeenCalledTimes(1);
      expect(sendEmailSpy).toHaveBeenCalledWith({
        to: [{ email: "test@example.com" }],
        content: expect.objectContaining({
          subject: "Teste de Email - AdvanceMais",
          htmlContent: expect.stringContaining("Teste de Email - AdvanceMais"),
          textContent: expect.stringContaining("Este é um email de teste"),
        }),
      });
    });
  });
});
