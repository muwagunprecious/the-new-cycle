
const { PrismaClient } = require('@prisma/client');

async function main() {
    const url = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require";
    console.log('Testing connection with hardcoded URL...');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });

    try {
        const userCount = await prisma.user.count();
        console.log('Success! User count:', userCount);
    } catch (error) {
        console.error('Connection failed:');
        console.error(error.message);
        if (error.code) console.error('Error code:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

main();
