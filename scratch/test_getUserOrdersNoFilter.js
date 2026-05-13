const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGetUserOrdersNoFilter(userId) {
    try {
        console.log(`Testing getUserOrders for userId: ${userId} without filters`);
        const orders = await prisma.order.findMany({
            where: {
                userId
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
        }
    } catch (error) {
        console.error('Error in testGetUserOrdersNoFilter:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

// Use a userId we know from scratch/check_orders.js
testGetUserOrdersNoFilter('650e4d45-95b7-4e10-8119-0701fd254127');