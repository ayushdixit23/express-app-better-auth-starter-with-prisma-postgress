import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "../utils/envConfig.js";

// Create a single Prisma Client instance
// Prisma automatically uses DATABASE_URL from environment variables
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

/**
 * Function to connect to PostgreSQL database using Prisma
 * @returns {Promise<void>} - Resolves when connected, rejects on error
 */
const connectDb = async (): Promise<void> => {
    try {
        await prisma.$connect();
        const maskedUrl = DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
        console.log(`✅ PostgreSQL connected via Prisma (${maskedUrl})`);
    } catch (error: any) {
        const errorCode = error.code || error.errorCode || 'Unknown';
        const errorMessage = error.message || String(error);
        console.error(`❌ Database connection failed [${errorCode}]: ${errorMessage}`);
        process.exit(1);
    }
};

/**
 * Gracefully disconnect from PostgreSQL
 */
export const disconnectDb = async (): Promise<void> => {
    try {
        await prisma.$disconnect();
        console.log("✅ PostgreSQL disconnected gracefully");
    } catch (error) {
        console.error("❌ Error disconnecting from PostgreSQL:", error);
    }
};

// Export Prisma client instance for use in other files
export { prisma };
export default connectDb;