const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            select: { id: true, name: true }
        });
        console.log('Total products:', products.length);
        console.log('Product list:', JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error fetching products:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
