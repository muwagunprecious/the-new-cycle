const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("--- Testing Large Payload Upload ---")

    // 1. Get a valid store and user
    const store = await prisma.store.findFirst({
        where: { status: 'approved' }
    })

    if (!store) {
        console.error("No approved store found to test with.")
        return
    }

    console.log(`Using Store: ${store.name} (${store.id})`)

    // 2. Generate a large fake image string (approx 4MB)
    const largeImage = "data:image/jpeg;base64," + "A".repeat(4 * 1024 * 1024)
    console.log("Generated payload size: ~4MB")

    // 3. Attempt creation
    const start = Date.now()
    try {
        console.log("Attempting database insert...")
        const product = await prisma.product.create({
            data: {
                name: "Large Payload Test Product",
                description: "Testing db limits",
                mrp: 1000,
                price: 1000,
                images: [largeImage], // Array of strings
                category: "Battery",
                type: 'CAR_BATTERY',
                condition: "SCRAP",
                pickupAddress: "Test Address",
                collectionDateStart: new Date(),
                collectionDateEnd: new Date(),
                quantity: 1,
                storeId: store.id,
                inStock: true
            }
        })
        const duration = (Date.now() - start) / 1000
        console.log(`✅ SUCCESS: Product created in ${duration}s`)
        console.log("Product ID:", product.id)

        // Cleanup
        await prisma.product.delete({ where: { id: product.id } })
        console.log("Cleanup: Test product deleted")

    } catch (e) {
        const duration = (Date.now() - start) / 1000
        console.error(`❌ FAILED after ${duration}s`)
        console.error(e.message)
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
