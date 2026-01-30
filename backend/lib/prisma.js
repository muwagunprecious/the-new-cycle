import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
        console.warn("WARN: DATABASE_URL is missing in production. Using defensive Proxy.")
        const proxyHandler = {
            get: (target, prop) => {
                if (prop === 'then') return undefined;
                return new Proxy(() => {
                    console.error(`ERROR: Attempted to access prisma.${String(prop)} but DATABASE_URL is missing.`)
                    return { success: false, error: "Database not configured." }
                }, proxyHandler);
            }
        };
        return new Proxy({}, proxyHandler);
    }

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
