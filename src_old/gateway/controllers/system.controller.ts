import { Request, Response } from "express";
import { BaseController } from "./base.controller";
import ApiResponse from "@/gateway/utils/response.util";

/**
 * Controlador para endpoints relacionados ao sistema
 */
export class SystemController extends BaseController {
  /**
   * Dependência para acessar o estado da aplicação
   */
  private appInstance: any;

  /**
   * Inicializa o controlador com a instância da aplicação
   * @param appInstance Instância da aplicação para verificar o estado do sistema
   */
  constructor(appInstance: any) {
    super();
    this.appInstance = appInstance;
  }

  /**
   * Retorna informações sobre a versão da API
   * @param req Requisição Express
   * @param res Resposta Express
   */
  public getVersion = async (req: Request, res: Response): Promise<void> => {
    await this.executeWithErrorHandling(req, res, async () => {
      ApiResponse.success(res, {
        name: "AdvanceMais API",
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
      });
    });
  };

  /**
   * Verifica a saúde do sistema e seus componentes
   * @param req Requisição Express
   * @param res Resposta Express
   */
  public healthCheck = async (req: Request, res: Response): Promise<void> => {
    await this.executeWithErrorHandling(req, res, async () => {
      const dbStatus = this.appInstance.isDatabaseAvailable()
        ? "connected"
        : "disconnected";
      const systemStatus = this.appInstance.isDatabaseAvailable()
        ? "ok"
        : "degraded";

      const healthInfo = {
        status: systemStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        database: dbStatus,
        uptime: process.uptime(),
        services: {
          auth: this.appInstance.isDatabaseAvailable()
            ? "available"
            : "unavailable",
          payment: this.appInstance.isDatabaseAvailable()
            ? "available"
            : "unavailable",
          notification: this.appInstance.isDatabaseAvailable()
            ? "available"
            : "unavailable",
          cms: this.appInstance.isDatabaseAvailable()
            ? "available"
            : "unavailable",
          jobs: this.appInstance.isDatabaseAvailable()
            ? "available"
            : "unavailable",
        },
      };

      // Para manter compatibilidade com a implementação retorna
      // diretamente o objeto JSON em vez de usar ApiResponse
      res.status(200).json(healthInfo);
    });
  };

  /**
   * Retorna informações sobre as variáveis de ambiente (apenas desenvolvimento)
   * @param req Requisição Express
   * @param res Resposta Express
   */
  public getEnvironmentInfo = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    await this.executeWithErrorHandling(req, res, async () => {
      // Retorna informações seguras sem expor secrets
      const safeEnvVars = {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL
          ? "***CONFIGURADO***"
          : "***NÃO CONFIGURADO***",
        CORS_ORIGIN: process.env.CORS_ORIGIN,
      };

      ApiResponse.success(res, safeEnvVars);
    });
  };
}

export default SystemController;
