const { PrismaClient } = require('@prisma/client');
const directUrl = "postgresql://postgres.owrvuvowerbkgswkorio:FVa5jOVCCenTzBn3@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable";
const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } });

async function main() {
    try {
        const allProducts = await prisma.product.findMany();
        console.log("All products in DB:", allProducts.length);

        const products = await prisma.product.findMany({
            where: {
                store: { status: 'approved', isActive: true }
            },
            include: {
                store: {
                    select: { name: true, address: true, isVerified: true, status: true, isActive: true }
                }
            }
        });
        console.log("Filtered products:", products.length);
        if (products.length > 0) {
            console.log(JSON.stringify(products[0], null, 2));
        } else {
            console.log("Wait, let's see the store relation:");
            const stores = await prisma.store.findMany();
            console.log(JSON.stringify(stores, null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
main();
