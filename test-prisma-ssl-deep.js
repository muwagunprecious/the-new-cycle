
const { PrismaClient } = require('@prisma/client');

const urls = [
    "postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify",
    "postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable",
    "postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=no-verify",
    "postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=disable"
];

async function test() {
    for (const url of urls) {
        console.log(`Testing URL: ${url.replace(/:.*@/, ':****@')}`);
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
}

test();
