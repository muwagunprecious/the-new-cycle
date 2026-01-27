const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Creating test product with dates...");

    // Find a valid store
    const store = await prisma.store.findFirst({
        where: { status: 'approved' }
    });

    if (!store) {
        console.error("No approved store found. Please approve a store first.");
        return;
    }

    const dates = [
        new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        new Date(Date.now() + 172800000).toISOString().split('T')[0] // Day after
    ];

    try {
        const product = await prisma.product.create({
            data: {
                name: "Test Battery with Dates",
                description: "Testing collection dates display",
                mrp: 20000,
                price: 15000,
                images: ["https://placehold.co/400x400?text=Battery"],
                category: "Battery",
                type: "CAR_BATTERY",
                condition: "SCRAP",
                pickupAddress: "123 Test Street, Ikeja",
                collectionDateStart: new Date(dates[0]),
                collectionDateEnd: new Date(dates[dates.length - 1]),
                collectionDates: dates,
                quantity: 10,
                storeId: store.id,
                inStock: true
            }
        });

        console.log("✓ Product created with ID:", product.id);
        console.log("✓ Collection Dates saved:", product.collectionDates);

    } catch (err) {
        console.error("Error creating product:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
