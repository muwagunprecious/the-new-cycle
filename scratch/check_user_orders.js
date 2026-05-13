const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserOrders() {
    try {
        console.log("Checking orders for user_y6noa0ikq...");
        const orders = await prisma.order.findMany({
            where: {
                userId: 'user_y6noa0ikq'
            },
            select: {
                id: true,
                status: true,
                isPaid: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`Found ${orders.length} total orders for user:`);
        orders.forEach((o, index) => {
            console.log(`${index + 1}: ID: ${o.id}, Status: ${o.status}, isPaid: ${o.isPaid}, Created: ${o.createdAt}`);
        });
    } catch (error) {
        console.error('Error in checkUserOrders:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserOrders();