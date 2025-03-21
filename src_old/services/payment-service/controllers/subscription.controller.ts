import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SubscriptionService } from '../subscription.service';
import { ICreateSubscriptionDTO, SubscriptionStatus, FrequencyType } from '../interfaces/subscription.interface';
import { isWebhookSignatureValid } from '@shared/config/mercadopago';

/**
 * Controlador para operações relacionadas a assinaturas
 */
export class SubscriptionController {
  private subscriptionService: SubscriptionService;
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.subscriptionService = new SubscriptionService(this.prisma);
  }

  /**
   * Cria uma nova assinatura
   * @param req Requisição com dados da assinatura
   * @param res Resposta da API
   */
  public createSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const subscriptionData: ICreateSubscriptionDTO = req.body;
      
      // Adicionar validações dos dados de entrada
      if (!subscriptionData.user_id || !subscriptionData.plan_id || !subscriptionData.payment_method_id) {
        res.status(400).json({
          status: 'error',
          message: 'Dados de assinatura incompletos'
        });
        return;
      }

      // Criar a assinatura
      const subscription = await this.subscriptionService.createSubscription(subscriptionData);

      res.status(201).json({
        status: 'success',
        data: subscription
      });
    } catch (error) {
      console.error('❌ Erro ao criar assinatura:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao processar a assinatura'
      });
    }
  };

  /**
   * Retorna os detalhes de uma assinatura
   * @param req Requisição com ID da assinatura
   * @param res Resposta da API
   */
  public getSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'ID da assinatura não informado'
        });
        return;
      }

      const subscription = await this.subscriptionService.getSubscription(id);

      res.status(200).json({
        status: 'success',
        data: subscription
      });
    } catch (error) {
      console.error(`❌ Erro ao buscar assinatura ${req.params.id}:`, error);
      
      // Verificar se é erro de assinatura não encontrada
      const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar assinatura';
      const statusCode = errorMessage.includes('não encontrada') ? 404 : 500;
      
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage
      });
    }
  };

  /**
   * Consulta a assinatura ativa de um usuário
   * @param req Requisição com ID do usuário
   * @param res Resposta da API
   */
  public getActiveSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'ID do usuário não informado'
        });
        return;
      }

      const subscription = await this.subscriptionService.getActiveSubscriptionByUserId(Number(userId));

      if (!subscription) {
        res.status(404).json({
          status: 'error',
          message: 'Usuário não possui assinatura ativa'
        });
        return;
      }

      res.status(200).json({
        status: 'success',
        data: subscription
      });
    } catch (error) {
      console.error(`❌ Erro ao buscar assinatura ativa do usuário ${req.params.userId}:`, error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao buscar assinatura ativa'
      });
    }
  };

  /**
   * Verifica se um usuário possui assinatura ativa
   * @param req Requisição com ID do usuário
   * @param res Resposta da API
   */
  public checkUserSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({
          status: 'error',
          message: 'ID do usuário não informado'
        });
        return;
      }

      const hasActiveSubscription = await this.subscriptionService.hasActiveSubscription(Number(userId));

      res.status(200).json({
        status: 'success',
        data: {
          hasActiveSubscription
        }
      });
    } catch (error) {
      console.error(`❌ Erro ao verificar assinatura do usuário ${req.params.userId}:`, error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao verificar assinatura'
      });
    }
  };

  /**
   * Lista assinaturas com filtros opcionais
   * @param req Requisição com filtros
   * @param res Resposta da API
   */
  public listSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        user_id: req.query.user_id ? Number(req.query.user_id) : undefined,
        status: req.query.status as SubscriptionStatus | undefined,
        plan_id: req.query.plan_id as string | undefined,
        start_date: req.query.start_date ? new Date(req.query.start_date as string) : undefined,
        end_date: req.query.end_date ? new Date(req.query.end_date as string) : undefined,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10
      };

      const { subscriptions, total } = await this.subscriptionService.listSubscriptions(filters);

      res.status(200).json({
        status: 'success',
        data: subscriptions,
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
          pages: Math.ceil(total / filters.limit)
        }
      });
    } catch (error) {
      console.error('❌ Erro ao listar assinaturas:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao listar assinaturas'
      });
    }
  };

  /**
   * Cancela uma assinatura ativa
   * @param req Requisição com ID da assinatura
   * @param res Resposta da API
   */
  public cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'ID da assinatura não informado'
        });
        return;
      }

      const subscription = await this.subscriptionService.cancelSubscription(id);

      res.status(200).json({
        status: 'success',
        data: subscription
      });
    } catch (error) {
      console.error(`❌ Erro ao cancelar assinatura ${req.params.id}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao cancelar assinatura';
      
      // Verificar se é erro de assinatura não encontrada ou status inválido
      let statusCode = 500;
      if (errorMessage.includes('não encontrada')) {
        statusCode = 404;
      } else if (errorMessage.includes('já está')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage
      });
    }
  };

  /**
   * Pausa uma assinatura ativa
   * @param req Requisição com ID da assinatura
   * @param res Resposta da API
   */
  public pauseSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'ID da assinatura não informado'
        });
        return;
      }

      const subscription = await this.subscriptionService.pauseSubscription(id);

      res.status(200).json({
        status: 'success',
        data: subscription
      });
    } catch (error) {
      console.error(`❌ Erro ao pausar assinatura ${req.params.id}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao pausar assinatura';
      
      // Verificar se é erro de assinatura não encontrada ou status inválido
      let statusCode = 500;
      if (errorMessage.includes('não encontrada')) {
        statusCode = 404;
      } else if (errorMessage.includes('não pode ser pausada')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage
      });
    }
  };

  /**
   * Reativa uma assinatura pausada
   * @param req Requisição com ID da assinatura
   * @param res Resposta da API
   */
  public reactivateSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          status: 'error',
          message: 'ID da assinatura não informado'
        });
        return;
      }

      const subscription = await this.subscriptionService.reactivateSubscription(id);

      res.status(200).json({
        status: 'success',
        data: subscription
      });
    } catch (error) {
      console.error(`❌ Erro ao reativar assinatura ${req.params.id}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao reativar assinatura';
      
      // Verificar se é erro de assinatura não encontrada ou status inválido
      let statusCode = 500;
      if (errorMessage.includes('não encontrada')) {
        statusCode = 404;
      } else if (errorMessage.includes('Apenas assinaturas pausadas')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        status: 'error',
        message: errorMessage
      });
    }
  };

  /**
   * Processa webhook do Mercado Pago para assinaturas
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
      const result = await this.subscriptionService.processWebhook(data);

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
      console.error('❌ Erro ao processar webhook de assinatura:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao processar webhook'
      });
    }
  };
}