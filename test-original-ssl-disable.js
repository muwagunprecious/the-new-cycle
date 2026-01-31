
const { PrismaClient } = require('@prisma/client');

async function test() {
    const url = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";
    console.log(`Testing ORIGINAL project URL with sslmode=disable...`);
    const prisma = new PrismaClient({
        datasources: { db: { url } }
    });
    try {
        await prisma.$connect();
        console.log('  SUCCESS!');
        const count = await prisma.user.count();
        console.log('  User count:', count);
        await prisma.$disconnect();
    } catch (err) {
        console.log('  FAILED:', err.message.split('\n')[0]);
        await prisma.$disconnect();
    }
}

test();
