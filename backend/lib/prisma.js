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

    // Forcefully fix the connection string if it's pointing to the old unreachable host
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('connect.supabase.com')) {
        console.warn("[PrismaInit] DETECTED OLD HOST! Forcefully overriding to pooler...");
        process.env.DATABASE_URL = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";
    }

    if (process.env.DATABASE_URL) {
        const host = process.env.DATABASE_URL.split('@')[1]?.split(':')[0] || 'unknown';
        console.log(`[PrismaInit] Using DATABASE_URL with host: ${host}`);
    } else {
        console.log(`[PrismaInit] DATABASE_URL is NOT set in process.env`);
    }

    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
