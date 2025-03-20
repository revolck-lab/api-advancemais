import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware para proteger a documentação da API com autenticação básica
 * As credenciais devem ser definidas nas variáveis de ambiente:
 * - DOCS_USERNAME: nome de usuário para acessar a documentação
 * - DOCS_PASSWORD: senha para acessar a documentação
 */
const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Caminho seguro para a documentação
  const DOCS_PATH_PREFIX = '/api/docs/v1';
  
  // Verifica se a rota solicitada é a documentação
  if (req.path.startsWith(DOCS_PATH_PREFIX)) {
    // Obtém credenciais das variáveis de ambiente
    const expectedUsername = process.env.DOCS_USERNAME;
    const expectedPassword = process.env.DOCS_PASSWORD;
    
    // Verifica se as credenciais estão configuradas
    if (!expectedUsername || !expectedPassword) {
      console.error('⚠️ Credenciais para documentação não configuradas. Configure DOCS_USERNAME e DOCS_PASSWORD.');
      return res.status(500).json({
        status: 'error',
        message: 'Configuração de segurança indisponível'
      });
    }
    
    // Extrai as credenciais do cabeçalho de autorização
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // Se não houver cabeçalho de autorização ou não for Basic Auth
      res.setHeader('WWW-Authenticate', 'Basic realm="Documentação da API AdvanceMais"');
      return res.status(401).json({
        status: 'error',
        message: 'Autenticação necessária para acessar a documentação'
      });
    }
    
    // Decodifica as credenciais (formato: "Basic base64(username:password)")
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');
    
    // Verifica se as credenciais são válidas
    if (username !== expectedUsername || password !== expectedPassword) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Documentação da API AdvanceMais"');
      return res.status(401).json({
        status: 'error',
        message: 'Credenciais inválidas'
      });
    }
  }
  
  // Se não for a rota de documentação ou se a autenticação for bem-sucedida
  next();
};

export default AuthMiddleware;