import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
        console.warn("WARN: DATABASE_URL is missing in production. Using defensive Proxy.")
        return new Proxy({}, {
            get: (target, prop) => {
                if (prop === 'then') return undefined; // Handle async/await checks
                return (...args) => {
                    console.error(`ERROR: Attempted to access prisma.${String(prop)} but DATABASE_URL is missing.`)
                    return { success: false, error: "Database connection not configured." }
                }
            }
        })
    }

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
