const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const stores = await prisma.store.findMany();
        console.log("Existing Stores:", stores);

        const users = await prisma.user.findMany({ where: { role: 'SELLER' } });
        console.log("Existing Sellers:", users.map(u => ({ id: u.id, name: u.name, email: u.email })));
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}
check();
