const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const sellers = await prisma.user.findMany({
            where: { role: 'SELLER' },
            include: { store: true }
        });
        console.log(`Found ${sellers.length} sellers.`);
        sellers.forEach(s => {
            console.log(`UserID: ${s.id}`);
            console.log(`Email: ${s.email}`);
            console.log(`Store State: ${s.store ? s.store.status : 'NO_STORE'}`);
            console.log(`Store Active: ${s.store ? s.store.isActive : 'N/A'}`);
            console.log('---');
        });
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
