const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrisma() {
    try {
        console.log("Testing Prisma connection to Store table...");
        const stores = await prisma.store.findMany();
        console.log(`Success! Found ${stores.length} stores.`);
    } catch (err) {
        console.error("Prisma Error:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

testPrisma();
