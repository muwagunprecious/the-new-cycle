const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetUserOrders(userId) {
    try {
        console.log(`Testing getUserOrders for userId: ${userId}`);
        const orders = await prisma.$transaction(async (tx) => {
            return await tx.order.findMany({
                where: {
                    userId,
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
        }, {
            isolationLevel: 'Serializable'
        });
        console.log('Orders found:', orders.length);
        if (orders.length > 0) {
            console.log('First order:', JSON.stringify(orders[0], null, 2));
        }
    } catch (error) {
        console.error('Error in testGetUserOrders:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

// Use a userId we know from scratch/check_orders.js
testGetUserOrders('650e4d45-95b7-4e10-8119-0701fd254127');