import { Application } from 'express';
import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import basicAuth from 'express-basic-auth';
import { version } from '../../package.json';

/**
 * Configura o Swagger para documentação da API
 * @param app Instância Express
 */
export const configureSwagger = (app: Application): void => {
  console.log('Configurando Swagger...');
  
  // Nova URL para a documentação
  const docsUrl = '/api/v1/docs';
  
  // Opções básicas de configuração
  const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'AdvanceMais API',
        version: version || '1.0.0',
        description: 'Documentação da API do AdvanceMais.',
        contact: {
          name: 'Suporte AdvanceMais',
          email: 'suporte@advancemais.com.br'
        },
        license: {
          name: 'Proprietário',
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
      tags: [
        { name: 'Autenticação', description: 'Endpoints para autenticação e cadastro de usuários' },
        { name: 'Usuários', description: 'Gerenciamento de usuários do sistema' },
        { name: 'Empresas', description: 'Gerenciamento de empresas e escritórios jurídicos' },
        { name: 'Pagamentos', description: 'Processamento de pagamentos e assinaturas' },
        { name: 'CMS', description: 'Gerenciamento de conteúdo do site' },
      ]
    },
    // Caminhos para arquivos com anotações JSDoc
    apis: [
      path.join(__dirname, '../swagger/schemas/*.js'),
      path.join(__dirname, '../gateway/routes/*.js'),
      path.join(__dirname, '../gateway/controllers/*.js'),
      path.join(__dirname, '../services/**/routes/*.js'),
      path.join(__dirname, '../services/**/controllers/*.js'),
    ],
  };

  try {
    // Gera a especificação Swagger
    const swaggerSpec = swaggerJSDoc(swaggerOptions);
    
    // Configuração de autenticação básica
    const username = process.env.DOCS_USERNAME || 'admin';
    const password = process.env.DOCS_PASSWORD || 'advancemais2025';
    
    // Usar Basic Auth do express-basic-auth para proteção da documentação
    const basicAuthMiddleware = basicAuth({
      users: { [username]: password },
      challenge: true,
      realm: 'Documentação da API AdvanceMais',
    });

    // CSS personalizado
    const customCss = getSwaggerCustomCSS();
    
    // Aplica autenticação básica na rota da documentação
    app.use(docsUrl, basicAuthMiddleware, swaggerUi.serve);
    app.get(docsUrl, swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: customCss,
      customSiteTitle: 'AdvanceMais API - Documentação',
      customfavIcon: '/favicon.ico',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        displayRequestDuration: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 2,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      }
    }));
    
    // Também protege o JSON da documentação
    app.get(`${docsUrl}.json`, basicAuthMiddleware, (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
    
    // Redirecionar da rota anterior
    app.get('/api-docs', (req, res) => {
      res.redirect(docsUrl);
    });
    
    console.log(`✅ Documentação Swagger configurada com sucesso em ${docsUrl}`);
    console.log(`✅ Credenciais para acesso: ${username}:${password}`);
    
    // Se estiver usando credenciais padrão, mostrar aviso
    if (!process.env.DOCS_USERNAME || !process.env.DOCS_PASSWORD) {
      console.warn('⚠️ AVISO: Usando credenciais padrão para a documentação!');
      console.warn('⚠️ Configure DOCS_USERNAME e DOCS_PASSWORD nas variáveis de ambiente para aumentar a segurança.');
    }
  } catch (error) {
    console.error('❌ Erro ao configurar Swagger:', error);
  }
};

/**
 * Retorna o CSS personalizado para o Swagger UI
 */
function getSwaggerCustomCSS(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    body {
      margin: 0;
      padding: 0;
      background: #f8f9fa;
    }
    
    .swagger-ui .topbar {
      background-color: #2c3e50;
      padding: 10px 0;
      height: 60px;
    }
    
    .swagger-ui .info {
      margin: 30px 0;
    }
    
    .swagger-ui .info .title {
      color: #2c3e50;
      font-weight: 700;
      font-size: 28px;
    }
    
    /* Estilo lateral como Mercado Pago */
    .swagger-ui .wrapper {
      display: flex;
      padding: 0;
      max-width: 100%;
    }
    
    /* Cria uma barra lateral artificial */
    .swagger-ui .wrapper:before {
      content: "";
      display: block;
      width: 240px;
      min-width: 240px;
      background: #ffffff;
      border-right: 1px solid #e0e0e0;
      min-height: 100vh;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    /* Estiliza o conteúdo principal */
    .swagger-ui .wrapper .opblock-tag-section {
      width: calc(100% - 240px);
      box-sizing: border-box;
      padding-left: 20px;
    }
    
    /* Altera estilo dos métodos HTTP */
    .swagger-ui .opblock-get .opblock-summary-method {
      background-color: #00BCD4;
    }
    
    .swagger-ui .opblock-post .opblock-summary-method {
      background-color: #00C853;
    }
    
    .swagger-ui .opblock-put .opblock-summary-method {
      background-color: #FB8C00;
    }
    
    .swagger-ui .opblock-delete .opblock-summary-method {
      background-color: #F44336;
    }
    
    /* Blocos de operação */
    .swagger-ui .opblock {
      margin: 0 0 15px;
      border-radius: 8px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      border: none;
    }
    
    .swagger-ui .opblock.opblock-get {
      border-color: #00BCD4;
      background: rgba(0, 188, 212, 0.05);
    }
    
    .swagger-ui .opblock.opblock-post {
      border-color: #00C853;
      background: rgba(0, 200, 83, 0.05);
    }
    
    .swagger-ui .opblock.opblock-put {
      border-color: #FB8C00;
      background: rgba(251, 140, 0, 0.05);
    }
    
    .swagger-ui .opblock.opblock-delete {
      border-color: #F44336;
      background: rgba(244, 67, 54, 0.05);
    }
    
    /* Melhorar o layout para mobile */
    @media (max-width: 768px) {
      .swagger-ui .wrapper:before {
        display: none;
      }
      
      .swagger-ui .wrapper .opblock-tag-section {
        width: 100%;
        padding-left: 0;
      }
    }
  `;
}