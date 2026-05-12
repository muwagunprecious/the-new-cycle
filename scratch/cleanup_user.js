const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    // Show recent users
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, email: true, phone: true, name: true, createdAt: true, role: true }
    });
    console.table(users);

    // Delete users created in the last 2 hours (test accounts)
    const twoHoursAgo = new Date(Date.now() - 2 * 3600000);
    const newUsers = await prisma.user.findMany({
        where: { createdAt: { gte: twoHoursAgo } }
    });

    if (newUsers.length === 0) {
        console.log('\nNo recent test users found.');
    }

    for (const user of newUsers) {
        console.log(`\nDeleting user: ${user.id} (${user.email || user.phone})`);
        try {
            // Delete store + products first
            const store = await prisma.store.findUnique({ where: { userId: user.id } });
            if (store) {
                await prisma.orderItem.deleteMany({ where: { product: { storeId: store.id } } });
                await prisma.product.deleteMany({ where: { storeId: store.id } });
                await prisma.store.delete({ where: { id: store.id } });
                console.log(`  ✓ Store deleted`);
            }
            // Delete orders and notifications
            await prisma.order.deleteMany({ where: { userId: user.id } });
            await prisma.notification.deleteMany({ where: { userId: user.id } });
            await prisma.user.delete({ where: { id: user.id } });
            console.log(`  ✓ User deleted`);
        } catch (e) {
            console.error(`  ✗ Failed: ${e.message}`);
        }
    }

    await prisma.$disconnect();
    console.log('\nDone. You can now re-register.');
}

run();
