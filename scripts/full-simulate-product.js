const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mimic the logic from backend/actions/product.js
// but without revalidatePath (which needs Next.js context)
async function simulateCreateProduct(data, userId) {
    const startTime = Date.now();
    const log = (msg) => console.log(`[${new Date().toISOString()}] SIM: ${msg}`);

    try {
        log(`[START] Creating product for user: ${userId}`);

        const price = parseFloat(data.price);
        const units = parseInt(data.unitsAvailable);
        const amps = parseInt(data.amps) || 0;

        log(`VALIDATED: Price=${price}, Units=${units}, Amps=${amps}`);

        log("DB_CALL: Finding store for userId...");
        const store = await prisma.store.findUnique({
            where: { userId }
        });

        if (!store) {
            log(`ERROR: Store not found for user ${userId}`);
            return { success: false, error: "Store not found" };
        }
        log(`STORE_FOUND: id=${store.id}, status=${store.status}`);

        const startRaw = data.collectionDates[0];
        const collectionDateStart = new Date(startRaw);
        const collectionDateEnd = new Date(data.collectionDates[data.collectionDates.length - 1]);

        log(`DATES_PROCESSED: Start=${collectionDateStart.toISOString()}`);

        log("DB_CALL: Attempting prisma.product.create...");
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.comments || "",
                mrp: price * 1.2,
                price: price,
                images: data.images || [],
                category: "Battery",
                type: data.batteryType === 'Car Battery' ? 'CAR_BATTERY' :
                    data.batteryType === 'Inverter Battery' ? 'INVERTER_BATTERY' : 'HEAVY_DUTY_BATTERY',
                brand: data.brand || "",
                amps: amps,
                condition: data.condition || "SCRAP",
                pickupAddress: data.address,
                collectionDateStart,
                collectionDateEnd,
                collectionDates: data.collectionDates,
                quantity: units,
                storeId: store.id,
                inStock: true
            }
        });
        log(`SUCCESS: Product created with ID ${product.id}`);

        const duration = (Date.now() - startTime) / 1000;
        log(`[END] Total time: ${duration}s`);

        return { success: true, product };

    } catch (error) {
        log(`CRITICAL_ERROR: ${error.message}`);
        return { success: false, error: error.message };
    }
}

async function run() {
    // data from frontend simulation
    const fakeData = {
        name: "Scrap Car Battery (60Ah) - Ikeja",
        batteryType: "Car Battery",
        brand: "Luminous",
        amps: "60",
        condition: "SCRAP",
        unitsAvailable: 2,
        price: 15000,
        lga: "Ikeja",
        address: "45 Ikeja Road",
        collectionDates: [new Date().toISOString()],
        comments: "Good condition scrap",
        images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="]
    };

    const userId = "seller_demo"; // Based on diag-sellers.js output

    const result = await simulateCreateProduct(fakeData, userId);
    console.log("FINAL_RESULT:", JSON.stringify(result, null, 2));

    await prisma.$disconnect();
}

run();
