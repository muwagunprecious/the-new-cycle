import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
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

    const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
    
    // Create client with explicit connection parameters
    return new PrismaClient({
        datasources: {
            db: {
                url: dbUrl
            }
        },
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
}

const globalForPrisma = globalThis

// Force a fresh client with the new connection parameters
const prisma = prismaClientSingleton() 

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
