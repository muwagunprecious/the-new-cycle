const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function testConnection(url, label) {
    const prisma = new PrismaClient({
        datasources: { db: { url } }
    });

    try {
        await prisma.$queryRaw`SELECT 1`;
        return `[OK] ${label}: Connected successfully\n`;
    } catch (error) {
        const msg = error.message.replace(/\n/g, " | ");
        return `[FAIL] ${label}: ${msg}\n`;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const p = {
        id: "tsjphcyurlfxmxtvkucc",
        pass: "WjuULVcLBKYgFCot",
        region: "eu-west-1"
    };

    let output = "--- FINAL VERIFICATION ---\n";

    const dbUrl = `postgresql://postgres.${p.id}:${p.pass}@aws-1-${p.region}.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable`;
    const directUrl = `postgresql://postgres.${p.id}:${p.pass}@aws-1-${p.region}.pooler.supabase.com:5432/postgres?sslmode=disable`;

    output += await testConnection(dbUrl, "DATABASE_URL (6543)");
    output += await testConnection(directUrl, "DIRECT_URL (5432)");

    fs.writeFileSync('scripts/diag_output.txt', output);
    console.log("\nResults written to scripts/diag_output.txt");
}

main();
