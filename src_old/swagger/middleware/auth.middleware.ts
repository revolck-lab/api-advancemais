import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware de autenticação simplificado para a documentação da API
 */
const AuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Caminhos protegidos de documentação
  const protectedPaths = ['/api-docs', '/api-docs/', '/api-docs.json', '/api/docs/v1'];
  
  // Verifica se a rota solicitada está na lista de caminhos protegidos
  if (protectedPaths.some(path => req.path === path || req.path.startsWith(path + '/'))) {
    // Verifica se as credenciais existem no arquivo .env
    const configuredUsername = process.env.DOCS_USERNAME;
    const configuredPassword = process.env.DOCS_PASSWORD;
    
    // Se não houver credenciais configuradas, continuar sem autenticação
    // mas logar um aviso
    if (!configuredUsername || !configuredPassword) {
      console.warn('⚠️ Aviso: Credenciais para documentação não configuradas em .env');
      console.warn('⚠️ Configure DOCS_USERNAME e DOCS_PASSWORD para proteger a documentação');
      next();
      return;
    }
    
    // Obter o header de autorização
    const authHeader = req.headers.authorization;
    
    // Se não houver header de autorização ou não for Basic Auth
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Documentação da API AdvanceMais"');
      res.status(401).json({
        status: 'error',
        message: 'Autenticação necessária para acessar a documentação'
      });
      return;
    }
    
    // Decodificar credenciais (Basic base64(username:password))
    try {
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');
      
      // Verificar credenciais
      if (username === configuredUsername && password === configuredPassword) {
        next();
        return;
      } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Documentação da API AdvanceMais"');
        res.status(401).json({
          status: 'error',
          message: 'Credenciais inválidas'
        });
        return;
      }
    } catch (error) {
      // Em caso de erro na decodificação, solicitar autenticação novamente
      res.setHeader('WWW-Authenticate', 'Basic realm="Documentação da API AdvanceMais"');
      res.status(401).json({
        status: 'error',
        message: 'Formato de autenticação inválido'
      });
      return;
    }
  }
  
  // Para todas as outras rotas, continuar normalmente
  next();
};

export default AuthMiddleware;