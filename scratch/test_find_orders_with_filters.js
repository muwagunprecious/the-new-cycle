const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFindOrdersWithFilters() {
    try {
        console.log("Testing find orders with filters (isPaid: true, status in list)");
        const orders = await prisma.order.findMany({
            where: {
                userId: 'user_y6noa0ikq',
                isPaid: true,
                status: {
                    in: ['PAID', 'APPROVED', 'PROCESSING', 'SHIPPED', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'ORDER_PLACED']
                }
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                },
                store: {
                    include: {
                        user: {
                            select: {
                                phone: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log('Orders found:', orders.length);
        if (orders.length > 0) {
            console.log('First order:', JSON.stringify(orders[0], null, 2));
        } else {
            console.log("No orders found with those filters.");
            // Let's check what orders exist for this user without filters
            const allOrders = await prisma.order.findMany({
                where: {
                    userId: 'user_y6noa0ikq'
                },
                select: {
                    id: true,
                    status: true,
                    isPaid: true
                }
            });
            console.log("All orders for user:", allOrders);
        }
    } catch (error) {
        console.error('Error in testFindOrdersWithFilters:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testFindOrdersWithFilters();