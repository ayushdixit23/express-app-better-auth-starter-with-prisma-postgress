import { Server } from "http";
import { disconnectDb } from "../config/database.js";

// Track if shutdown handlers are already registered
let shutdownHandlersRegistered = false;

// Increase max listeners to prevent warnings during development (nodemon hot reloads)
if (process.env.NODE_ENV === "development") {
  process.setMaxListeners(15);
}

/**
 * Gracefully shutdown the application
 * @param server - HTTP server instance
 */
export const setupGracefulShutdown = (server: Server): void => {
  // Prevent multiple registrations (important for nodemon hot reloads)
  if (shutdownHandlersRegistered) {
    return;
  }

  shutdownHandlersRegistered = true;

  let isShuttingDown = false;
  let shutdownTimeout: NodeJS.Timeout | null = null;

  const shutdown = async (signal: string) => {
    // Prevent multiple shutdown calls
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

    // Clear any existing timeout
    if (shutdownTimeout) {
      clearTimeout(shutdownTimeout);
    }

    // Stop accepting new connections
    server.close(async () => {
      console.log("🔌 HTTP server closed");

      try {
        // Close database connection
        await disconnectDb();

        console.log("✅ All connections closed. Exiting process.");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
      }
    });

    // Force shutdown after timeout
    shutdownTimeout = setTimeout(() => {
      console.error("⚠️  Forced shutdown due to timeout");
      process.exit(1);
    }, 10000); // 10 seconds timeout
  };

  // Listen for termination signals (use once to prevent duplicates)
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  process.once("SIGINT", () => shutdown("SIGINT"));

  // Handle uncaught exceptions (only register once)
  process.once("uncaughtException", (error: Error) => {
    console.error("❌ Uncaught Exception:", error);
    shutdown("UNCAUGHT_EXCEPTION");
  });

  // Handle unhandled promise rejections (only register once)
  process.once("unhandledRejection", (reason: unknown, promise: Promise<unknown>) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    shutdown("UNHANDLED_REJECTION");
  });
};

