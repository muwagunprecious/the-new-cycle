const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Attempting to connect to database...");
        const userCount = await prisma.user.count();
        console.log("Connection successful. User count:", userCount);
    } catch (error) {
        console.error("Connection failed!");
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
