
const { PrismaClient } = require('@prisma/client');

async function check(url, name) {
    const prisma = new PrismaClient({ datasources: { db: { url } } });
    try {
        await prisma.$connect();
        console.log(`WORKING_${name}: ${url.replace(/:.*@/, ':****@')}`);
        await prisma.$disconnect();
    } catch (err) {
        console.log(`FAILED_${name}: ${err.message.split('\n')[0]}`);
        await prisma.$disconnect();
    }
}

async function main() {
    await check("postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable", "POOLER_DISABLE");
    await check("postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=no-verify", "POOLER_NOVERIFY");
    await check("postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=disable", "DIRECT_DISABLE");
}

main();
