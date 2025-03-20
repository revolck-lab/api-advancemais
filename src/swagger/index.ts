import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import path from 'path';
import { version } from '../../package.json';

/**
 * Configuração do Swagger para documentação da API
 */
export default class SwaggerConfig {
  /**
   * Inicializa a documentação Swagger na aplicação Express
   * @param app - Instância do Express
   */
  public static setup(app: Express): void {
    // Opções básicas de configuração
    const swaggerOptions: swaggerJSDoc.Options = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'AdvanceMais API',
          version: version || '1.0.0',
          description: 'Documentação da API do AdvanceMais',
          contact: {
            name: 'Suporte AdvanceMais',
            email: 'suporte@advancemais.com.br'
          },
          license: {
            name: 'Proprietária',
          },
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Servidor de Desenvolvimento',
          },
          {
            url: 'https://api.advancemais.com.br',
            description: 'Servidor de Produção',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        // Tags para agrupamento de endpoints
        tags: [
          {
            name: 'Auth',
            description: 'Endpoints de autenticação',
          },
          {
            name: 'Users',
            description: 'Gerenciamento de usuários',
          },
          {
            name: 'Companies',
            description: 'Gerenciamento de empresas',
          },
          {
            name: 'CMS',
            description: 'Gerenciamento de conteúdo',
          },
          {
            name: 'Payments',
            description: 'Processamento de pagamentos',
          },
        ],
      },
      // Caminhos para arquivos com anotações JSDoc
      apis: [
        path.join(__dirname, '../api-gateway/routes/*.ts'),
        path.join(__dirname, '../api-gateway/controllers/*.ts'),
        path.join(__dirname, '../services/**/routes/*.ts'),
        path.join(__dirname, '../services/**/controllers/*.ts'),
        path.join(__dirname, 'schemas/*.ts'),
      ],
    };

    // Gera a especificação Swagger
    const swaggerSpec = swaggerJSDoc(swaggerOptions);

    // Configura o endpoint para a documentação Swagger
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'AdvanceMais API - Documentação',
    }));

    // Endpoint para obter a especificação em formato JSON
    app.get('/api-docs.json', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    console.log('📚 Documentação Swagger disponível em /api-docs');
  }
}