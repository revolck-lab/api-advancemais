/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: Mensagem de erro
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: array
 *           items:
 *             type: object
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               example: 100
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             pages:
 *               type: integer
 *               example: 10
 *     
 *   parameters:
 *     PageParam:
 *       in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *       description: Número da página para paginação
 *     LimitParam:
 *       in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 10
 *       description: Limite de itens por página
 *     SortParam:
 *       in: query
 *       name: sort
 *       schema:
 *         type: string
 *       description: Campo para ordenação (prefixo - para descendente)
 *     IdParam:
 *       in: path
 *       name: id
 *       required: true
 *       schema:
 *         type: integer
 *       description: ID do recurso
 *     
 *   responses:
 *     Unauthorized:
 *       description: Acesso não autorizado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     NotFound:
 *       description: Recurso não encontrado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     BadRequest:
 *       description: Requisição inválida
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     InternalError:
 *       description: Erro interno do servidor
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *             
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */