import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma

/**
 * Wraps a Prisma DB call with automatic retry logic.
 * Retries once on connection/timeout errors before giving up.
 * @param {Function} fn - Async function to execute
 * @param {number} retries - Number of retries
 */
export async function withRetry(fn, retries = 1) {
  try {
    return await fn()
  } catch (error) {
    const isConnectionError =
      error?.code === 'P1001' ||
      error?.code === 'P1002' ||
      error?.code === 'P1008' ||
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes("connection")

    if (retries > 0 && isConnectionError) {
      console.warn(`[PRISMA] Connection error, retrying... (${retries} left)`)
      await new Promise(r => setTimeout(r, 500))
      return withRetry(fn, retries - 1)
    }
    throw error
  }
}
