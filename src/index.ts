import express, { Request, Response } from "express";
import { 
  NODE_ENV, 
  PORT, 
  ALLOWED_ORIGINS,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS
} from "./utils/envConfig.js";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { rateLimit } from "express-rate-limit";
import routes from "./routes/index.js";
import { setupGracefulShutdown } from "./utils/gracefulShutdown.js";
import { toNodeHandler } from "better-auth/node";
import auth from "./lib/auth.js";
import connectDb from "./helpers/connectDb.js";

/**
 * Initialize Express application with all middleware and routes
 */
const initializeApp = async () => {
  // Initialize Express app
  const app = express();

  // CORS configuration - must be before Better Auth handler
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

  // Better Auth handler - Express v5 syntax
  app.all("/api/auth/*splat", toNodeHandler(auth));

  // Security middleware
  app.use(helmet());

  // Rate limiting middleware
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later.",
  });
  app.use(limiter);

  // Logging based on environment (development/production)
  const logFormat = NODE_ENV === "development" ? "dev" : "combined";
  app.use(morgan(logFormat));

  // Compression middleware - compress all responses
  app.use(compression());

  // Body parsing middleware - AFTER Better Auth handler
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Trust proxy - important for rate limiting behind reverse proxy
  if (NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

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

/**
 * Start the server
 */
const startServer = async () => {
  try {
    console.log("🚀 Starting server...\n");

    // Connect to database
    await connectDb();

    // Initialize Express app
    const app = await initializeApp();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log("\n" + "=".repeat(50));
      console.log(`✅ Server is running successfully!`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log("=".repeat(50) + "\n");
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
