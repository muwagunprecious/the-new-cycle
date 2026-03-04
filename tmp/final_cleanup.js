require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking connection...");
    try {
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);

        const demoEmails = ['admin@gocycle.com', 'adebayo@ecovolt.com', 'buyer@gocycle.com'];

        // 1. Clear relational data
        await prisma.orderItem.deleteMany({});
        await prisma.rating.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.notification.deleteMany({});
        console.log("Cleared orders/notifications/ratings.");

        // 2. Identify products to keep (only if seller is seller_demo)
        // Actually the user said "alo products uploaded by that demo seller"
        const seller = await prisma.user.findUnique({ where: { email: 'adebayo@ecovolt.com' } });
        if (seller) {
            const deletedProducts = await prisma.product.deleteMany({
                where: { sellerId: { not: seller.id } }
            });
            console.log(`Deleted ${deletedProducts.count} other products.`);
        } else {
            console.log("Seller demo not found, deleting all products.");
            await prisma.product.deleteMany({});
        }

        // 3. Delete non-demo users
        const deletedUsers = await prisma.user.deleteMany({
            where: { email: { notIn: demoEmails } }
        });
        console.log(`Deleted ${deletedUsers.count} non-demo users.`);

    } catch (error) {
        console.error("Critical Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
