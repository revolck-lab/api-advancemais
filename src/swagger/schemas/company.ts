/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da empresa
 *         cnpj:
 *           type: string
 *           description: CNPJ da empresa
 *         trade_name:
 *           type: string
 *           description: Nome fantasia
 *         business_name:
 *           type: string
 *           description: Razão social
 *         contact_name:
 *           type: string
 *           description: Nome do contato principal
 *         address_id:
 *           type: integer
 *           description: ID do endereço
 *         whatsapp:
 *           type: string
 *           description: Número do WhatsApp
 *         mobile_phone:
 *           type: string
 *           description: Telefone celular
 *         landline_phone:
 *           type: string
 *           nullable: true
 *           description: Telefone fixo
 *         email:
 *           type: string
 *           format: email
 *           description: Email da empresa
 *         status:
 *           type: integer
 *           description: Status da empresa (1=ativo, 0=inativo)
 *         role_id:
 *           type: integer
 *           description: ID do perfil/role
 *         avatar_url:
 *           type: string
 *           nullable: true
 *           description: URL da imagem de perfil da empresa
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Data de criação
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *       required:
 *         - cnpj
 *         - trade_name
 *         - business_name
 *         - contact_name
 *         - address_id
 *         - whatsapp
 *         - mobile_phone
 *         - email
 *         - password
 *         - role_id
 *     
 *     CompanyCreateInput:
 *       type: object
 *       properties:
 *         cnpj:
 *           type: string
 *           example: 12345678901234
 *         trade_name:
 *           type: string
 *           example: Empresa XYZ
 *         business_name:
 *           type: string
 *           example: XYZ Ltda
 *         contact_name:
 *           type: string
 *           example: Maria Santos
 *         whatsapp:
 *           type: string
 *           example: 11987654321
 *         mobile_phone:
 *           type: string
 *           example: 11987654321
 *         landline_phone:
 *           type: string
 *           example: 1123456789
 *         email:
 *           type: string
 *           format: email
 *           example: contato@empresa.com
 *         password:
 *           type: string
 *           format: password
 *           example: senha123
 *         role_id:
 *           type: integer
 *           example: 3
 *         address:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *               example: Av. Paulista
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
 *               example: 1000
 *       required:
 *         - cnpj
 *         - trade_name
 *         - business_name
 *         - contact_name
 *         - whatsapp
 *         - mobile_phone
 *         - email
 *         - password
 *         - role_id
 *         - address
 *     
 *     CompanyLoginInput:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: contato@empresa.com
 *         password:
 *           type: string
 *           format: password
 *           example: senha123
 *       required:
 *         - email
 *         - password
 *     
 *     CompanyLoginResponse:
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
 *             company:
 *               $ref: '#/components/schemas/Company'
 */