const { PrismaClient } = require('@prisma/client');

async function main() {
    // Exact string from .env
    const url = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";
    console.log('Testing connection with .env URL (Pooler, disable SSL)...');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });

    try {
        await prisma.$connect();
        console.log('CONNECTED successfully to Pooler!');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
    } catch (error) {
        console.error('Connection failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
