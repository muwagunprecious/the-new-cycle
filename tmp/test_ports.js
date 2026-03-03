const { PrismaClient } = require('@prisma/client');

async function testPort(name, url) {
    console.log(`\n--- Testing ${name} ---`);
    console.log(`URL: ${url.replace(/:.*@/, ":****@")}`);
    const prisma = new PrismaClient({
        datasources: { db: { url } },
    });

    try {
        const start = Date.now();
        const count = await prisma.user.count();
        console.log(`SUCCESS! User count: ${count} (${Date.now() - start}ms)`);
    } catch (error) {
        console.error(`FAILED: ${error.message}`);
        if (error.code) console.error(`Error Code: ${error.code}`);
    } finally {
        await prisma.$disconnect();
    }
}

async function runAll() {
    const dbUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;

    if (dbUrl) await testPort("DATABASE_URL (Pooler?)", dbUrl);
    if (directUrl) await testPort("DIRECT_URL", directUrl);

    process.exit(0);
}

runAll();
