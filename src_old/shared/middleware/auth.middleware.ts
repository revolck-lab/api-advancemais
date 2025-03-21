/**
 * Middleware de autenticação centralizado
 * Responsável por validar tokens JWT e garantir que o usuário esteja autenticado
 */

import { Request, Response, NextFunction } from "express";
import { JWTVerifyResult, jwtVerify } from "jose";
import { UserPayload } from "../interfaces/auth.interface";

/**
 * Interface que estende o objeto Request do Express para incluir o usuário autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * Middleware que verifica se o usuário está autenticado através do token JWT
 * @param req Objeto de requisição do Express
 * @param res Objeto de resposta do Express
 * @param next Função para passar para o próximo middleware
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtém o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        status: "error",
        message: "Token de autenticação não fornecido",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "Token de autenticação inválido",
      });
      return;
    }

    // Verifica o token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    try {
      const { payload } = (await jwtVerify(
        token,
        secret
      )) as JWTVerifyResult & { payload: UserPayload };

      // Adiciona o usuário decodificado à requisição
      req.user = payload;

      next();
    } catch (error) {
      // Token inválido ou expirado
      res.status(401).json({
        status: "error",
        message: "Token inválido ou expirado",
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware de autorização baseado em níveis de acesso
 * @param requiredLevel Nível mínimo de acesso necessário (1-8)
 * @returns Middleware de autorização configurado com o nível requerido
 */
export const accessLevel = (requiredLevel: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verifica se o usuário está autenticado
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Usuário não autenticado",
        });
        return;
      }

      // Verifica se o usuário possui o nível de acesso necessário
      if (req.user.role.level < requiredLevel) {
        res.status(403).json({
          status: "error",
          message: "Acesso negado. Nível de permissão insuficiente",
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware para verificar acesso específico para empresa
 * @returns Middleware para verificar se é uma empresa ou admin
 */
export const isCompanyOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.user) {
      res.status(401).json({
        status: "error",
        message: "Usuário não autenticado",
      });
      return;
    }

    // Verifica se é empresa (nível 3) ou administrador (nível 4 ou superior)
    if (req.user.role.name !== "Empresa" && req.user.role.level < 4) {
      res.status(403).json({
        status: "error",
        message: "Acesso restrito a empresas e administradores",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar se é o próprio usuário ou um admin
 * @param paramIdField Nome do parâmetro que contém o ID do usuário (default: 'id')
 * @returns Middleware configurado
 */
export const isSelfOrAdmin = (paramIdField: string = "id") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verifica se o usuário está autenticado
      if (!req.user) {
        res.status(401).json({
          status: "error",
          message: "Usuário não autenticado",
        });
        return;
      }

      const resourceId = parseInt(req.params[paramIdField], 10);

      // Verifica se é o próprio usuário ou um administrador
      if (req.user.id !== resourceId && req.user.role.level < 4) {
        res.status(403).json({
          status: "error",
          message: "Acesso negado. Você só pode acessar seus próprios recursos",
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Exportar como objeto para facilitar importação
const authMiddleware = {
  authenticate,
  accessLevel,
  isCompanyOrAdmin,
  isSelfOrAdmin,
};

export default authMiddleware;
