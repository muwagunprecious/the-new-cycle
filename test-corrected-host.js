const { PrismaClient } = require('@prisma/client');

async function main() {
    // Standard Direct URL for this project (guessing host based on ID)
    const url = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@db.tsjphcyurlfxmxtvkucc.supabase.co:5432/postgres?sslmode=disable";
    console.log('Testing connection with Direct Host URL (disable SSL)...');

    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });

    try {
        await prisma.$connect();
        console.log('CONNECTED successfully to Direct Host!');
        const userCount = await prisma.user.count();
        console.log('User count:', userCount);
    } catch (error) {
        console.error('Connection failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
