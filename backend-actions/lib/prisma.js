import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

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

const prisma = globalForPrisma.prisma ?? globalForPrisma.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaGlobal = prisma
}

if (process.env.NODE_ENV !== 'production' && !globalForPrisma.prismaShutdownHooksRegistered) {
  globalForPrisma.prismaShutdownHooksRegistered = true
  const disconnect = async () => {
    try {
      await prisma.$disconnect()
    } catch (error) {
      console.warn('[PRISMA] Disconnect failed during shutdown', error)
    }
  }
  process.once('beforeExit', disconnect)
  process.once('SIGINT', async () => {
    await disconnect()
    process.exit(0)
  })
  process.once('SIGTERM', async () => {
    await disconnect()
    process.exit(0)
  })
}

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
      error?.message?.includes('pool timeout') ||
      error?.message?.includes('EMAXCONNSESSION') ||
      error?.message?.includes('max clients reached')

    const poolIsExhausted =
      error?.message?.includes('EMAXCONNSESSION') ||
      error?.message?.includes('max clients reached')

    if (retries > 0 && isConnectionError && !poolIsExhausted) {
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
