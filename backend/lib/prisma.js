import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    if (!process.env.DATABASE_URL) {
        console.warn("WARN: DATABASE_URL is missing. Prisma Client will not work.")
        // Return a proxy that logs error when accessed to preventing crash on import
        return new Proxy({}, {
            get: (target, prop) => {
                return () => {
                    console.error(`ERROR: Attempted to access prisma.${String(prop)} but DATABASE_URL is missing.`)
                    throw new Error("DATABASE_URL is missing. Check your environment variables.")
                }
            }
        })
    }

    return new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
