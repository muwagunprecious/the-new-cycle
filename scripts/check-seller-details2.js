const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Fetching stores...");
        const stores = await prisma.store.findMany();
        console.log("Existing Stores:", stores.length);

        console.log("Fetching sellers...");
        const users = await prisma.user.findMany({ where: { role: 'SELLER' } });
        console.log("Existing Sellers:", users.length);
    } catch (err) {
        console.error("Error Message:", err.message);
        console.error("Error Name:", err.name);
        console.error("Error Code:", err.code);
        console.error("Error Meta:", err.meta);
    } finally {
        await prisma.$disconnect();
    }
}
check();
