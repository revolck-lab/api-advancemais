import express, { Application } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import morgan from "morgan";
import path from "path";

// Importar configurações
import { config } from "@/shared/config/env";

// Importar middleware e rotas (com caminho corrigido)
import { errorMiddleware } from "@/gateway/middleware/error.middleware";
import { setupRoutes } from "@/gateway/routes";

/**
 * Inicialização da aplicação Express
 */
const app: Application = express();

// Configurar middleware de segurança
app.use(helmet());

// Configurar CORS
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Configurar middleware de compressão
app.use(compression());

// Configuração de logs HTTP
if (config.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Configurar parsers JSON e urlencoded
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Configurar rate limiting
app.use(
  rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: "error",
      message: "Muitas requisições, tente novamente mais tarde",
    },
  })
);

// Configurar pasta de arquivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

// Configurar rotas
setupRoutes(app);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorMiddleware);

export { app };
