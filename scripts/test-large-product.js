const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulateLargeProduct() {
    // Create a large fake base64 string (approx 2MB)
    const largeString = 'A'.repeat(2 * 1024 * 1024);
    const images = [
        `data:image/jpeg;base64,${largeString}`,
        `data:image/jpeg;base64,${largeString}`
    ];

    console.log('Total payload size (images):', (images.join('').length / 1024 / 1024).toFixed(2), 'MB');

    try {
        // We need a store ID
        const store = await prisma.store.findFirst();
        if (!store) {
            console.error('No store found to associate product with.');
            return;
        }

        console.log('Attempting to create product with large images...');
        const startTime = Date.now();
        const product = await prisma.product.create({
            data: {
                name: "Large Image Test",
                description: "Testing if large base64 images cause hangs",
                mrp: 1000,
                price: 800,
                images: images,
                category: "Test",
                type: "CAR_BATTERY",
                amps: 60,
                condition: "SCRAP",
                pickupAddress: "Test Address",
                collectionDateStart: new Date(),
                collectionDateEnd: new Date(),
                collectionDates: [new Date().toISOString()],
                quantity: 1,
                storeId: store.id
            }
        });

        const duration = (Date.now() - startTime) / 1000;
        console.log(`Product created successfully in ${duration}s. ID: ${product.id}`);

    } catch (err) {
        console.error('Error during creation:', err);
    } finally {
        await prisma.$disconnect();
    }
}

simulateLargeProduct();
