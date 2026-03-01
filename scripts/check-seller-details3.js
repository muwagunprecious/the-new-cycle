const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Fetching sellers...");
        const users = await prisma.user.findMany({ where: { role: 'SELLER' } });
        console.log("Existing Sellers:", users.length);
    } catch (err) {
        console.error("FULL ERROR:");
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
check();
