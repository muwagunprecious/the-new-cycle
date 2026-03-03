const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        include: {
            store: true
        }
    });
    console.log("Total Products:", products.length);
    products.forEach(p => {
        console.log(`Product: ${p.name}`);
        console.log(`  Store: ${p.store.name} (Status: ${p.store.status}, Active: ${p.store.isActive})`);
    });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
