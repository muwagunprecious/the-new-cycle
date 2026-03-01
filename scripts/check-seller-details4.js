const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function check() {
    try {
        console.log("Fetching sellers...");
        const users = await prisma.user.findMany({ where: { role: 'SELLER' } });
        console.log("Existing Sellers:", users.length);
    } catch (err) {
        fs.writeFileSync('seller_full_err.txt', err.stack || err.message || String(err));
        console.log("Error written to seller_full_err.txt");
    } finally {
        await prisma.$disconnect();
    }
}
check();
