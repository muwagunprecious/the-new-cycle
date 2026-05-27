import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma

export default prisma

export async function withRetry(fn, retries = 1, timeoutMs = 10000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database operation timed out')), timeoutMs)
  )

  try {
    return await Promise.race([fn(), timeoutPromise])
  } catch (error) {
    const isConnectionError =
      error?.code === 'P1001' ||
      error?.code === 'P1002' ||
      error?.code === 'P1008' ||
      error?.code === 'P2024' ||
      error?.message?.includes('timed out') ||
      error?.message?.includes("Can't reach database") ||
      error?.message?.includes('connection') ||
      error?.message?.includes('pool timeout')

    if (retries > 0 && isConnectionError) {
      console.warn(`[PRISMA] Connection error or timeout, retrying... (${retries} left)`)
      try {
        await prisma.$connect()
      } catch {
        // The retry below will surface the original failure if reconnecting is impossible.
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
      return withRetry(fn, retries - 1, timeoutMs)
    }

    throw error
  }
}
