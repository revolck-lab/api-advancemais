const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'API de Usuários',
        version: '1.0.0',
        description: 'Documentação da API para cadastro e autenticação de usuários',
      },
      servers: [
        {
          url: 'http://localhost:3000/api',
        },
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Nome completo do usuário',
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'Email do usuário',
              },
              password: {
                type: 'string',
                description: 'Senha do usuário',
              },
              cpf: {
                type: 'string',
                description: 'CPF do usuário',
              },
              phone_user: {
                type: 'string',
                description: 'Número de telefone do usuário',
              },
              gender_id: {
                type: 'integer',
                description: 'ID de gênero do usuário',
              },
              address: {
                type: 'string',
                description: 'Endereço do usuário',
              },
              city: {
                type: 'string',
                description: 'Cidade do usuário',
              },
              state: {
                type: 'string',
                description: 'Estado do usuário',
              },
              cep: {
                type: 'string',
                description: 'CEP do usuário',
              },
              birth_date: {
                type: 'string',
                format: 'date',
                description: 'Data de nascimento do usuário',
              },
              status: {
                type: 'integer',
                description: 'Status do usuário (0 ou 1)',
              },
            },
          },
          Login: {
            type: 'object',
            properties: {
              login: {
                type: 'number',
                format: 'cpf' || 'cnpj',
                description: 'CPF ou CNPJ do usuário',
              },
              password: {
                type: 'string',
                description: 'Senha do usuário',
              },
            },
          },
        },
      },
    },
    apis: ['./src/modules/*/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = {
    swaggerUi,
    swaggerDocs
}