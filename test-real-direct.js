
const { PrismaClient } = require('@prisma/client');

async function main() {
    const url = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@db.tsjphcyurlfxmxtvkucc.supabase.co:5432/postgres?sslmode=require";
    console.log('Testing connection with REAL DIRECT URL (db.tsjphcyurlfxmxtvkucc.supabase.co:5432)...');

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
