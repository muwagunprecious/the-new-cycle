const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const variants = [
    "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require",
    "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable",
    "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require",
    "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable",
    "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.connect.supabase.com:5432/postgres?sslmode=require",
    "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.connect.supabase.com:5432/postgres?sslmode=disable"
];

async function test() {
    for (const url of variants) {
        console.log(`\nTesting variant: ${url}`);
        process.env.DATABASE_URL = url;
        const prisma = new PrismaClient({
            datasources: { db: { url } }
        });

        try {
            const start = Date.now();
            await prisma.$connect();
            console.log(`✅ SUCCESS in ${Date.now() - start}ms`);
            await prisma.$disconnect();
        } catch (e) {
            console.log(`❌ FAILED: ${e.message.split('\n')[0]}`);
        }
    }
}

test();
