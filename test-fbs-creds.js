
const { PrismaClient } = require('@prisma/client');

async function main() {
    const url = "postgresql://postgres.fbsmnlinkndqiiicpuet:GocycleAfrica123@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require";
    console.log('Testing connection with fbsmnlinkndqiiicpuet (from .env.bak)...');

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
    } finally {
        await prisma.$disconnect();
    }
}

main();
