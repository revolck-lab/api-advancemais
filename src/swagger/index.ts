import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import path from 'path';
import { version } from '../../package.json';

/**
 * Configuração do Swagger para documentação da API
 */
export default class SwaggerConfig {
  /**
   * Inicializa a documentação Swagger na aplicação Express
   * @param app - Instância da aplicação Express
   */
  public static setup(app: Application): void {
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
            url: 'https://api-advancemais.onrender.com',
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

    // Usar a rota padrão para simplificar o acesso
    const docsPath = '/api-docs';
    
    // Configuração para servir o Swagger UI
    app.use(docsPath, swaggerUi.serve);
    app.get(docsPath, swaggerUi.setup(swaggerSpec, {
      explorer: true, 
      customCss: `
        .swagger-ui .topbar { display: none }
        body { font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif; }
        .swagger-ui .btn.execute { background-color: #2ecc71; border-color: #2ecc71; }
        .swagger-ui .btn.execute:hover { background-color: #27ae60; }
        .swagger-ui .opblock.opblock-get { border-color: #61affe; background: rgba(97, 175, 254, 0.1); }
        .swagger-ui .opblock.opblock-post { border-color: #49cc90; background: rgba(73, 204, 144, 0.1); }
        .swagger-ui .opblock.opblock-put { border-color: #fca130; background: rgba(252, 161, 48, 0.1); }
        .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; background: rgba(249, 62, 62, 0.1); }
        .swagger-ui .info .title { font-weight: 700; }
        .swagger-ui .scheme-container { background-color: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
      `,
      customSiteTitle: 'AdvanceMais API - Documentação',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        filter: true,
        displayRequestDuration: true,
      }
    }));

    // Endpoint para obter a especificação em formato JSON
    app.get(`${docsPath}.json`, (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });

    // Redirecionamento da rota antiga que estávamos tentando usar
    app.get('/api/docs/v1', (req, res) => {
      res.redirect(docsPath);
    });

    console.log(`📚 Documentação Swagger disponível em ${docsPath}`);
  }
}