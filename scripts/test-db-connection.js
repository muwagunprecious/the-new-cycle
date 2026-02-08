const { PrismaClient } = require('@prisma/client');

async function testConnection(url, label) {
    const prisma = new PrismaClient({
        datasources: { db: { url } }
    });

    try {
        await prisma.$queryRaw`SELECT 1`;
        return { label, success: true };
    } catch (error) {
        return { label, success: false, error: error.message.split('\n')[0] };
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

    const variations = [
        { label: "Connect:SSL:Disable", url: `postgresql://postgres.${p.id}:${p.pass}@aws-1-${p.region}.connect.supabase.com:5432/postgres?sslmode=disable` },
        { label: "Connect:SSL:Require", url: `postgresql://postgres.${p.id}:${p.pass}@aws-1-${p.region}.connect.supabase.com:5432/postgres?sslmode=require` },
        { label: "Pooler:SSL:Disable", url: `postgresql://postgres.${p.id}:${p.pass}@aws-0-${p.region}.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable` },
        { label: "Pooler:SSL:Require", url: `postgresql://postgres.${p.id}:${p.pass}@aws-0-${p.region}.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` },
        { label: "Direct:SSL:Disable", url: `postgresql://postgres.${p.id}:${p.pass}@db.${p.id}.supabase.co:5432/postgres?sslmode=disable` },
        { label: "Direct:SSL:Require", url: `postgresql://postgres.${p.id}:${p.pass}@db.${p.id}.supabase.co:5432/postgres?sslmode=require` }
    ];

    console.log("Starting tests for " + p.id + "...");
    const results = [];
    for (const v of variations) {
        results.push(await testConnection(v.url, v.label));
    }

    console.log("\n--- TEST RESULTS ---");
    results.forEach(r => {
        if (r.success) {
            console.log(`[OK] ${r.label}`);
        } else {
            console.log(`[FAIL] ${r.label}: ${r.error}`);
        }
    });
}

main().catch(console.error);
