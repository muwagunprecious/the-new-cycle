import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool optimization for Supabase
    // connection_limit=10 to match Supabase pooler limits
    // pool_timeout prevents long waits for connections
  })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma

/**
 * Wraps a Prisma DB call with automatic retry logic and timeout.
 * Retries once on connection/timeout errors before giving up.
 * @param {Function} fn - Async function to execute
 * @param {number} retries - Number of retries
 * @param {number} timeoutMs - Timeout in milliseconds
 */
export async function withRetry(fn, retries = 1, timeoutMs = 10000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Database operation timed out")), timeoutMs)
  );

  try {
    return await Promise.race([fn(), timeoutPromise]);
  } catch (error) {
    const isConnectionError =
      error?.code === 'P1001' ||
      error?.code === 'P1002' ||
      error?.code === 'P1008' ||
      error?.code === 'P2024' ||
      error?.message?.includes("timed out") ||
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes("connection") ||
      error?.message?.includes("pool timeout")

    if (retries > 0 && isConnectionError) {
      console.warn(`[PRISMA] Connection error or timeout, retrying... (${retries} left)`)
      // Try to re-connect if it was a connection error
      try { await prisma.$connect() } catch (e) {}
      await new Promise(r => setTimeout(r, 1000))
      return withRetry(fn, retries - 1, timeoutMs)
    }
    throw error
  }
}
