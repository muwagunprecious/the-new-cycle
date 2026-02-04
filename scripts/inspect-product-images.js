const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log(`Checking ${products.length} most recent products:`);
        products.forEach(p => {
            console.log(`Product ID: ${p.id}`);
            console.log(`Name: ${p.name}`);
            console.log(`Images (Type: ${typeof p.images}, IsArray: ${Array.isArray(p.images)}):`);
            if (Array.isArray(p.images)) {
                console.log(`  Count: ${p.images.length}`);
                p.images.forEach((img, i) => {
                    console.log(`  [${i}]: ${img.substring(0, 100)}${img.length > 100 ? '...' : ''} (Length: ${img.length})`);
                });
            } else {
                console.log(`  Value: ${JSON.stringify(p.images)}`);
            }
            console.log('---');
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
