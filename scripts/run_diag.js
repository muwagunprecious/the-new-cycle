const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function testConnection(url, label) {
    const prisma = new PrismaClient({
        datasources: { db: { url } }
    });

    try {
        await prisma.$queryRaw`SELECT 1`;
        return `[OK] ${label}\n`;
    } catch (error) {
        // Capture a broader range of the error message
        const msg = error.message.replace(/\n/g, " | ");
        return `[FAIL] ${label}: ${msg}\n`;
    } finally {
        await prisma.$disconnect();
    }
}

async function main() {
    const projects = [
        {
            id: "tsjphcyurlfxmxtvkucc",
            pass: "WjuULVcLBKYgFCot",
            region: "eu-west-1",
            label: "TSJ"
        },
        {
            id: "mrswfnmpmhbufhorutew",
            pass: "IglooEstate2026!",
            region: "eu-north-1",
            label: "IGLOO"
        }
    ];

    let output = "--- VERBOSE MULTI-PROJECT DIAGNOSTIC ---\n";
    for (const p of projects) {
        process.stdout.write(`Testing project ${p.label} (${p.id})...\n`);

        // Test Pooler Transaction mode
        const poolerUrl = `postgresql://postgres.${p.id}:${p.pass}@aws-0-${p.region}.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable`;
        output += await testConnection(poolerUrl, `${p.label}:Pooler:6543`);

        // Test Direct
        const directUrl = `postgresql://postgres.${p.id}:${p.pass}@db.${p.id}.supabase.co:5432/postgres?sslmode=disable`;
        output += await testConnection(directUrl, `${p.label}:Direct:5432`);
    }

    fs.writeFileSync('scripts/diag_output.txt', output);
    console.log("\nResults written to scripts/diag_output.txt");
}

main().catch(e => {
    fs.writeFileSync('scripts/diag_output.txt', "CRASH: " + e.message);
});
