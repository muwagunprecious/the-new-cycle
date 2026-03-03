const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const products = await prisma.product.findMany({
        include: {
            store: {
                select: { name: true, status: true, isActive: true, isVerified: true }
            }
        }
    });

    const stores = await prisma.store.findMany({
        select: { name: true, status: true, isActive: true }
    });

    console.log(JSON.stringify({
        productCount: products.length,
        storeCount: stores.length,
        products: products.map(p => ({
            name: p.name,
            storeStatus: p.store?.status,
            storeActive: p.store?.isActive,
            pickupAddress: p.pickupAddress,
            id: p.id
        })),
        allStores: stores
    }, null, 2));

    process.exit(0);
}

check().catch(e => {
    console.error(e);
    process.exit(1);
});
