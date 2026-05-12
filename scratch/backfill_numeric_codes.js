const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
    console.log("Starting backfill of verification codes...");
    // Fetch all orders that haven't been completed yet (or all if needed)
    const orders = await prisma.order.findMany({
        where: {
            status: { not: 'COMPLETED' }
        }
    });

    console.log(`Checking ${orders.length} active orders...`);

    let updateCount = 0;
    for (const order of orders) {
        // If code is not 6 digits long or contains non-numeric characters
        if (order.verificationCode.length !== 6 || !/^\d+$/.test(order.verificationCode)) {
            const newCode = Math.floor(100000 + Math.random() * 900000).toString();
            await prisma.order.update({
                where: { id: order.id },
                data: { verificationCode: newCode }
            });
            console.log(`Updated Order ${order.id}: ${order.verificationCode} -> ${newCode}`);
            updateCount++;
        }
    }

    console.log(`Backfill complete. Updated ${updateCount} orders.`);
}

backfill()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
