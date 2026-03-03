const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log("--- Orphaned Sellers (No Store) ---");
    const sellers = await prisma.user.findMany({
        where: {
            role: 'SELLER',
            store: null
        },
        select: { id: true, name: true, phone: true, email: true }
    });
    console.log(JSON.stringify(sellers, null, 2));

    console.log("\n--- Duplicate Phone Audit (Normalized) ---");
    const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, phone: true }
    });

    const normalized = allUsers.map(u => ({
        id: u.id,
        original: u.phone,
        digits: u.phone.replace(/\D/g, '')
    }));

    const counts = {};
    normalized.forEach(u => {
        counts[u.digits] = (counts[u.digits] || 0) + 1;
    });

    const duplicates = normalized.filter(u => counts[u.digits] > 1);
    console.log("Phone Digit Collisions:", JSON.stringify(duplicates, null, 2));

    process.exit(0);
}

check().catch(e => {
    console.error(e);
    process.exit(1);
});
