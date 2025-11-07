import express, { Request, Response } from "express";
import { 
  NODE_ENV, 
  ALLOWED_ORIGINS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS
} from "./config/env.js";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { rateLimit } from "express-rate-limit";
import routes from "./routes/index.js";
import { toNodeHandler } from "better-auth/node";
import auth from "./lib/auth.js";

/**
 * Initialize Express application with all middleware and routes
 * @returns {Promise<express.Application>} Configured Express application
 */
export const createApp = async (): Promise<express.Application> => {
  // Initialize Express app
  const app = express();

  // Trust proxy - MUST be set early for correct IP detection in rate limiting
  if (NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Logging middleware - must be before Better Auth handler to log auth requests
  const logFormat = NODE_ENV === "development" ? "dev" : "combined";
  app.use(morgan(logFormat));

  // Security middleware
  app.use(helmet());

  // Compression middleware - compress all responses
  app.use(compression());

  // Rate limiting middleware - after trust proxy for correct IP detection
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use(limiter);

  // Better Auth handler
  app.all("/api/auth/*splat", toNodeHandler(auth));

  // Body parsing middleware - AFTER Better Auth handler
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Root route
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      message: "🚀 Express API Server",
      version: "1.0.0",
      environment: NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API routes
  app.use("/", routes);

  // 404 Handler for non-existent routes
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ 
      success: false,
      message: "Route not found",
      statusCode: 404
    });
  });

  // Error Handling Middleware (must be last)
  app.use(errorMiddleware);

  return app;
};

