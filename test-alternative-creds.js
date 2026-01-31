
const { PrismaClient } = require('@prisma/client');

async function main() {
    const url = "postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require";
    console.log('Testing connection with ALTERNATIVE URL (eu-north-1)...');

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
