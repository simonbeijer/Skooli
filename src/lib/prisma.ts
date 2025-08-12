/**
 * Prisma Database Client Configuration
 * 
 * Properly typed Prisma client with global instance management
 * for development hot-reload prevention and production optimization.
 */

import { PrismaClient } from '@prisma/client';

// ============================================================================
// GLOBAL PRISMA INSTANCE TYPING
// ============================================================================

declare global {
  var prisma: PrismaClient | undefined;
}

// ============================================================================
// PRISMA CLIENT INSTANCE MANAGEMENT
// ============================================================================

/**
 * Global Prisma client instance
 * 
 * In development, we store the client on the global object to prevent
 * multiple instances being created during hot-reload cycles.
 * In production, we create a new instance each time.
 */
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Store the instance globally in development to prevent hot-reload issues
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

// ============================================================================
// PRISMA CLIENT EXTENSIONS & MIDDLEWARE
// ============================================================================

/**
 * Add any Prisma middleware or extensions here
 * Example: Soft delete, audit logging, etc.
 */

// Example: Add timestamp middleware for audit trails
// prisma.$use(async (params, next) => {
//   if (params.action === 'create') {
//     params.args.data.createdAt = new Date();
//   }
//   if (params.action === 'update') {
//     params.args.data.updatedAt = new Date();
//   }
//   return next(params);
// });

// ============================================================================
// PRISMA UTILITIES
// ============================================================================

/**
 * Gracefully disconnect from the database
 * Useful for cleanup in tests or application shutdown
 */
export const disconnectPrisma = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from Prisma:', error);
  }
};

/**
 * Check database connection health
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

/**
 * Get database connection info
 */
export const getDatabaseInfo = async (): Promise<{ url?: string; connected: boolean }> => {
  try {
    const connected = await checkDatabaseConnection();
    return {
      url: process.env.DATABASE_URL ? 'Connected' : 'No DATABASE_URL',
      connected,
    };
  } catch (error) {
    return {
      url: 'Error checking connection',
      connected: false,
    };
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export { prisma };
export default prisma;