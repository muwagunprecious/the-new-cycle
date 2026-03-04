const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Starting DB Cleanup...");

    // 1. Identify Demo Users
    const demoEmails = ['admin@gocycle.com', 'adebayo@ecovolt.com', 'buyer@gocycle.com'];
    const demoUsers = await prisma.user.findMany({
        where: { email: { in: demoEmails } }
    });

    const demoUserIds = demoUsers.map(u => u.id);
    const sellerDemo = demoUsers.find(u => u.email === 'adebayo@ecovolt.com');

    if (!sellerDemo) {
        console.error("Seller demo account not found in DB! Please seed first if needed.");
        return;
    }

    console.log(`Found ${demoUsers.length} demo users.`);
    console.log(`Seller Demo ID: ${sellerDemo.id}`);

    // 2. Delete all products NOT belonging to the demo seller
    const deletedProducts = await prisma.product.deleteMany({
        where: { sellerId: { not: sellerDemo.id } }
    });
    console.log(`Deleted ${deletedProducts.count} non-demo products.`);

    // 3. Delete all orders (to be safe/clean)
    const deletedOrders = await prisma.order.deleteMany({});
    console.log(`Deleted ${deletedOrders.count} orders.`);

    // 4. Delete all reviews and notifications
    await prisma.review.deleteMany({});
    await prisma.notification.deleteMany({});
    console.log("Deleted all reviews and notifications.");

    // 5. Delete all users NOT in the demo set
    const deletedUsers = await prisma.user.deleteMany({
        where: { id: { notIn: demoUserIds } }
    });
    console.log(`Deleted ${deletedUsers.count} non-demo users.`);

    // 6. Special case: if buyer@gocycle.com wasn't found, we should keep the current emeka if that's what the user means, 
    // but the user specifically said "leave the demo account for the buyer, seller and admin, on the login form page".
    // The login form page uses buyer@gocycle.com.

    console.log("Cleanup complete!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
