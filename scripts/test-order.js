
const { PrismaClient } = require('@prisma/client');

async function testOrder() {
    const prisma = new PrismaClient();

    try {
        console.log('--- Testing Order Creation (No AddressId) ---');

        // Find a buyer
        const buyer = await prisma.user.findFirst({
            where: { role: 'USER' }
        });

        if (!buyer) {
            console.error('No buyer found. Run create-demo-seller first (it creates users too).');
            return;
        }

        // Find a product and its store
        const product = await prisma.product.findFirst({
            include: { store: true }
        });

        if (!product) {
            console.error('No product found. Please list a product first.');
            return;
        }

        const totalAmount = product.price;
        const collectionToken = "TEST12";

        console.log(`Creating order for product: ${product.name}`);
        console.log(`Buyer: ${buyer.name} (${buyer.id})`);

        const order = await prisma.order.create({
            data: {
                total: totalAmount,
                status: 'ORDER_PLACED',
                pickupStatus: 'PENDING',
                pickupToken: collectionToken,
                userId: buyer.id,
                storeId: product.storeId,
                isPaid: true,
                paymentMethod: 'STRIPE',
                orderItems: {
                    create: [
                        {
                            productId: product.id,
                            quantity: 1,
                            price: product.price
                        }
                    ]
                }
            }
        });

        console.log('SUCCESS: Order created successfully without addressId!');
        console.log('Order ID:', order.id);

        // Cleanup test order
        await prisma.order.delete({ where: { id: order.id } });
        console.log('Cleanup: Test order deleted.');

    } catch (error) {
        console.error('FAILURE: Order creation failed!');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

testOrder();
