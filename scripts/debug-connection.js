// require('dotenv').config(); // relying on node --env-file
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function main() {
    console.log("Testing connection...");
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL not found in environment");
        return;
    }
    console.log("URL:", url.replace(/:[^:@]*@/, ':****@'));

    try {
        await prisma.$connect();
        console.log("Connected successfully!");
        const count = await prisma.user.count();
        console.log("User count:", count);
    } catch (e) {
        console.error("Connection failed: CODE=" + e.code + " MSG=" + e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
