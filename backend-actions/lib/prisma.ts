import { PrismaClient } from '@prisma/client';

// Extend the global namespace to store the Prisma client across module reloads in development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma singleton instance.
 *
 * It reads the connection string from `process.env.DATABASE_URL` which already
 * includes the pgbouncer parameters (e.g., `pgbouncer=true&connection_limit=10`).
 * Prisma respects those parameters, so we do not need to set additional pool
 * configuration here.
 */
const prisma = global.prisma || new PrismaClient({
  // Optional: enable query logging during development for debugging.
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});
/**
 * Utility wrapper to retry a Prisma operation.
 * Useful for transient errors like connection timeouts or deadlocks.
 */
export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(res => setTimeout(res, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}


if (process.env.NODE_ENV !== 'production') {
  // Attach to global for reuse across module reloads.
  global.prisma = prisma;
}

// Gracefully disconnect when the Node process exits (important for dev server).
if (process.env.NODE_ENV !== 'production') {
  const shutdown = async () => {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('Error disconnecting Prisma client:', e);
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default prisma;
