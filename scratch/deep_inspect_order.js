const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orderId = process.argv[2] || 'GCY-P2YQJWP';
    console.log(`Deep Inspect for Order: ${orderId}`);
    
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            orderItems: {
                include: {
                    product: true
                }
            },
            user: true,
            store: true
        }
    });
    
    if (!order) {
        console.log("Order not found!");
        return;
    }
    
    console.log("Order Details:");
    console.log(`- Status: ${order.status}`);
    console.log(`- IsPaid: ${order.isPaid}`);
    console.log(`- User: ${order.user?.name} (${order.userId})`);
    console.log(`- Items Count: ${order.orderItems.length}`);
    
    order.orderItems.forEach((item, i) => {
        console.log(`  Item ${i+1}: ${item.product?.name || 'Unknown Product'} (Price: ${item.price}, Qty: ${item.quantity})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
