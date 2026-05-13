const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAnyOrders() {
    try {
        console.log("Checking for any orders in the database...");
        const orders = await prisma.order.findMany({
            take: 5,
            include: {
                user: { select: { id: true, name: true } }
            }
        });
        console.log(`Found ${orders.length} orders in total`);
        orders.forEach((o, index) => {
            console.log(`${index + 1}: ID: ${o.id}, UserID: ${o.userId}, UserName: ${o.user?.name}, Status: ${o.status}, isPaid: ${o.isPaid}, Created: ${o.createdAt}`);
        });
    } catch (error) {
        console.error('Error in checkAnyOrders:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

checkAnyOrders();