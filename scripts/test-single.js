const { PrismaClient } = require('@prisma/client');

async function main() {
    const url = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";
    console.log("Testing URL:", url.replace(/:.*@/, ':****@'));
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
        await prisma.$queryRaw`SELECT 1`;
        console.log("RESULT: CONNECTED_SUCCESSFULLY");
    } catch (e) {
        console.log("RESULT: FAILED");
        console.log("ERROR_MSG:", e.message.split('\n')[0]);
    } finally {
        await prisma.$disconnect();
    }
}
main();
