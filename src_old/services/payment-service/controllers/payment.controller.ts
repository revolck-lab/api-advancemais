import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PaymentService } from '../payment.service';
import { ICreatePaymentDTO, PaymentStatus, PaymentType } from '../interfaces/payment.interface';
import { isWebhookSignatureValid } from '@shared/config/mercadopago';

/**
 * Controlador para operações relacionadas a pagamentos
 */
export class PaymentController {
  private paymentService: PaymentService;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.paymentService = new PaymentService(this.prisma);
  }

  /**
   * Cria um novo pagamento
   * @param req Requisição com dados do pagamento
   * @param res Resposta da API
   */
  public createPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const paymentData: ICreatePaymentDTO = req.body;
      
      // Adicionar validações dos dados de entrada
      if (!paymentData.user_id || !paymentData.amount || !paymentData.description) {
        res.status(400).json({
          status: 'error',
          message: 'Dados de pagamento incompletos'
        });
        return;
      }

      // Criar o pagamento
      const payment = await this.paymentService.createPayment(paymentData);

      res.status(201).json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      console.error('❌ Erro ao criar pagamento:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao processar o pagamento'
      });
    }
  };

  /**
   * Retorna os detalhes de um pagamento
   * @param req Requisição com ID do pagamento
   * @param res Resposta da API
   */
  public getPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'ID do pagamento não informado'
        });
        return;
      }

      const payment = await this.paymentService.getPayment(id);

      res.status(200).json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      console.error(`❌ Erro ao buscar pagamento ${req.params.id}:`, error);
      
      // Verificar se é erro de pagamento não encontrado
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar pagamento';
      const statusCode = errorMessage.includes('não encontrado') ? 404 : 500;
      
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage
      });
    }
  };

  /**
   * Lista pagamentos com filtros opcionais
   * @param req Requisição com filtros
   * @param res Resposta da API
   */
  public listPayments = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        status: req.query.status as PaymentStatus | undefined,
        payment_type: req.query.payment_type as PaymentType | undefined,
        start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
        end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10
      };

      const { payments, total } = await this.paymentService.listPayments(filters);

      res.status(200).json({
        status: 'success',
        data: payments,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          pages: Math.ceil(total / filters.limit)
        }
      });
    } catch (error) {
      console.error('❌ Erro ao listar pagamentos:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao listar pagamentos'
      });
    }
  };

  /**
   * Cancela um pagamento pendente
   * @param req Requisição com ID do pagamento
   * @param res Resposta da API
   */
  public cancelPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'ID do pagamento não informado'
        });
        return;
      }

      const payment = await this.paymentService.cancelPayment(id);

      res.status(200).json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      console.error(`❌ Erro ao cancelar pagamento ${req.params.id}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar pagamento';
      
      // Verificar se é erro de pagamento não encontrado ou status inválido
      let statusCode = 500;
      if (errorMessage.includes('não encontrado')) {
        statusCode = 404;
      } else if (errorMessage.includes('não pode ser cancelado')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage
      });
    }
  };

  /**
   * Reembolsa um pagamento aprovado
   * @param req Requisição com ID do pagamento
   * @param res Resposta da API
   */
  public refundPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'ID do pagamento não informado'
        });
        return;
      }

      const payment = await this.paymentService.refundPayment(id);

      res.status(200).json({
        status: 'success',
        data: payment
      });
    } catch (error) {
      console.error(`❌ Erro ao reembolsar pagamento ${req.params.id}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reembolsar pagamento';
      
      // Verificar se é erro de pagamento não encontrado ou status inválido
      let statusCode = 500;
      if (errorMessage.includes('não encontrado')) {
        statusCode = 404;
      } else if (errorMessage.includes('Apenas pagamentos aprovados')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage
      });
    }
  };

  /**
   * Processa webhook do Mercado Pago
   * @param req Requisição com dados do webhook
   * @param res Resposta da API
   */
  public handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['x-signature'] as string;
      const data = req.body;

      // Verificar assinatura do webhook (opcional, mas recomendado)
      if (signature && !isWebhookSignatureValid(signature, data)) {
        res.status(401).json({
          status: 'error',
          message: 'Assinatura do webhook inválida'
        });
        return;
      }

      // Processar o webhook
      const result = await this.paymentService.processWebhook(data);

      if (result.success) {
        res.status(200).json({
          status: 'success',
          message: result.message
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: result.message
        });
      }
    } catch (error) {
      console.error('❌ Erro ao processar webhook:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao processar webhook'
      });
    }
  };
}