/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do pagamento
 *         user_id:
 *           type: integer
 *           description: ID do usuário
 *         amount:
 *           type: number
 *           format: float
 *           description: Valor do pagamento
 *         currency:
 *           type: string
 *           description: Moeda (ex. BRL)
 *         description:
 *           type: string
 *           description: Descrição do pagamento
 *         status:
 *           type: string
 *           enum: [pending, approved, authorized, in_process, in_mediation, rejected, cancelled, refunded, charged_back]
 *           description: Status do pagamento
 *         payment_method:
 *           type: string
 *           description: Método de pagamento utilizado
 *         payment_type:
 *           type: string
 *           enum: [credit_card, debit_card, pix, boleto, bank_transfer, wallet, subscription]
 *           description: Tipo de pagamento
 *         external_id:
 *           type: string
 *           description: ID do pagamento no Mercado Pago
 *         metadata:
 *           type: object
 *           description: Metadados adicionais do pagamento
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       required:
 *         - id
 *         - user_id
 *         - amount
 *         - currency
 *         - description
 *         - status
 *         - payment_method
 *         - payment_type
 *     
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único da assinatura
 *         user_id:
 *           type: integer
 *           description: ID do usuário
 *         plan_id:
 *           type: string
 *           description: ID do plano de assinatura
 *         status:
 *           type: string
 *           enum: [pending, authorized, active, paused, cancelled, ended, payment_failed]
 *           description: Status da assinatura
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Data de início da assinatura
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Data de término da assinatura (se definida)
 *         next_payment_date:
 *           type: string
 *           format: date-time
 *           description: Data do próximo pagamento
 *         payment_method_id:
 *           type: string
 *           description: Método de pagamento utilizado
 *         frequency:
 *           type: string
 *           description: Frequência de pagamento (ex. "1")
 *         frequency_type:
 *           type: string
 *           enum: [days, months, years]
 *           description: Tipo de frequência
 *         auto_recurring:
 *           type: boolean
 *           description: Indica se a assinatura é recorrente
 *         external_id:
 *           type: string
 *           description: ID da assinatura no Mercado Pago
 *         metadata:
 *           type: object
 *           description: Metadados adicionais da assinatura
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       required:
 *         - id
 *         - user_id
 *         - plan_id
 *         - status
 *         - start_date
 *         - payment_method_id
 *         - frequency
 *         - frequency_type
 *     
 *     SubscriptionPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do plano
 *         external_id:
 *           type: string
 *           description: ID do plano no Mercado Pago
 *         name:
 *           type: string
 *           description: Nome do plano
 *         description:
 *           type: string
 *           description: Descrição do plano
 *         amount:
 *           type: number
 *           format: float
 *           description: Valor do plano
 *         currency_id:
 *           type: string
 *           description: Moeda (ex. BRL)
 *         payment_type_id:
 *           type: string
 *           description: Tipo de pagamento aceito
 *         frequency:
 *           type: integer
 *           description: Frequência de pagamento
 *         frequency_type:
 *           type: string
 *           enum: [days, months, years]
 *           description: Tipo de frequência
 *         status:
 *           type: string
 *           description: Status do plano
 *         auto_recurring:
 *           type: boolean
 *           description: Indica se o plano é recorrente
 *         features:
 *           type: object
 *           description: Características e benefícios do plano
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       required:
 *         - id
 *         - name
 *         - amount
 *         - currency_id
 *         - frequency
 *         - frequency_type
 *         - status
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total de registros
 *         page:
 *           type: integer
 *           description: Página atual
 *         limit:
 *           type: integer
 *           description: Limite de registros por página
 *         pages:
 *           type: integer
 *           description: Total de páginas
 */