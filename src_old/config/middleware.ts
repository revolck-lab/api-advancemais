import { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import express from "express";
import path from "path";

/**
 * Configurações para o CORS
 */
const corsConfig = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
};

/**
 * Configurações para o rate limiting
 */
const rateLimitConfig = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutos
  limit: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "error",
    message: "Muitas requisições, por favor tente novamente mais tarde",
  },
};

/**
 * Configura middlewares de segurança (Helmet, CORS)
 */
const configureSecurityMiddlewares = (app: Application): void => {
  // Configurar o Helmet diretamente na chamada da função
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
            "https://cdn.jsdelivr.net",
          ],
          imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
          fontSrc: [
            "'self'",
            "https://fonts.gstatic.com",
            "https://cdn.jsdelivr.net",
          ],
          connectSrc: ["'self'"],
        },
      },
      referrerPolicy: {
        policy: "same-origin",
      },
    })
  );

  app.use(cors(corsConfig));
};

/**
 * Configura middlewares de performance (compressão, rate limit)
 */
const configurePerformanceMiddlewares = (app: Application): void => {
  app.use(compression());
  app.use(rateLimit(rateLimitConfig));
};

/**
 * Configura middleware para parsing de requisições
 */
const configureParsingMiddlewares = (app: Application): void => {
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
};

/**
 * Configura middleware para arquivos estáticos
 */
const configureStaticMiddlewares = (app: Application): void => {
  app.use(express.static(path.join(__dirname, "../../public")));
};

/**
 * Configura middleware de logging de requisições
 */
const configureLoggingMiddlewares = (app: Application): void => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log após a resposta ser enviada
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const logMessage = `[${new Date().toISOString()}] ${req.method} ${
        req.url
      } - ${res.statusCode} (${duration}ms)`;

      if (res.statusCode >= 400) {
        console.error(logMessage);
      } else {
        console.log(logMessage);
      }
    });

    next();
  });
};

/**
 * Configura todos os middlewares globais da aplicação
 * @param app Instância Express
 */
export const configureMiddlewares = (app: Application): void => {
  configureSecurityMiddlewares(app);
  configurePerformanceMiddlewares(app);
  configureParsingMiddlewares(app);
  configureStaticMiddlewares(app);
  configureLoggingMiddlewares(app);
};
