/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do usuário
 *         name:
 *           type: string
 *           description: Nome completo do usuário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário
 *         cpf:
 *           type: string
 *           description: CPF do usuário
 *         phone_user:
 *           type: string
 *           description: Telefone do usuário
 *         birth_date:
 *           type: string
 *           format: date
 *           description: Data de nascimento
 *         gender_id:
 *           type: integer
 *           description: ID do gênero
 *         education_id:
 *           type: integer
 *           description: ID do nível educacional
 *         status:
 *           type: integer
 *           description: Status do usuário (1=ativo, 0=inativo)
 *         code_user:
 *           type: string
 *           description: Código único do usuário
 *         role_id:
 *           type: integer
 *           description: ID do perfil/role
 *         address_id:
 *           type: integer
 *           description: ID do endereço
 *         avatar_url:
 *           type: string
 *           nullable: true
 *           description: URL da imagem de perfil
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       required:
 *         - name
 *         - email
 *         - password
 *         - cpf
 *         - phone_user
 *         - birth_date
 *         - gender_id
 *         - education_id
 *         - code_user
 *         - role_id
 *         - address_id
 *     
 *     UserCreateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: João Silva
 *         email:
 *           type: string
 *           format: email
 *           example: joao@exemplo.com
 *         password:
 *           type: string
 *           format: password
 *           example: senha123
 *         cpf:
 *           type: string
 *           example: 12345678901
 *         phone_user:
 *           type: string
 *           example: 11987654321
 *         birth_date:
 *           type: string
 *           format: date
 *           example: 1990-01-01
 *         gender_id:
 *           type: integer
 *           example: 1
 *         education_id:
 *           type: integer
 *           example: 3
 *         role_id:
 *           type: integer
 *           example: 2
 *         address:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               example: Rua das Flores
 *             city:
 *               type: string
 *               example: São Paulo
 *             state:
 *               type: string
 *               example: SP
 *             cep:
 *               type: string
 *               example: 01234567
 *             number:
 *               type: integer
 *               example: 123
 *       required:
 *         - name
 *         - email
 *         - password
 *         - cpf
 *         - phone_user
 *         - birth_date
 *         - gender_id
 *         - education_id
 *         - role_id
 *         - address
 *     
 *     UserLoginInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: joao@exemplo.com
 *         password:
 *           type: string
 *           format: password
 *           example: senha123
 *       required:
 *         - email
 *         - password
 *     
 *     UserLoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *             user:
 *               $ref: '#/components/schemas/User'
 */