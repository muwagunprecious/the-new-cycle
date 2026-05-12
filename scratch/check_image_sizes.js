const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImageSizes() {
    try {
        const products = await prisma.product.findMany({
            select: { id: true, name: true, images: true }
        });

        console.log(`Checking ${products.length} products...`);
        
        let totalSize = 0;
        let largestImage = 0;
        let largestProduct = '';

        products.forEach(p => {
            const size = JSON.stringify(p.images).length;
            totalSize += size;
            if (size > largestImage) {
                largestImage = size;
                largestProduct = p.name;
            }
            console.log(`Product: ${p.name.padEnd(30)} | Images Size: ${(size / 1024).toFixed(2)} KB | Count: ${p.images.length}`);
        });

        console.log('\n--- SUMMARY ---');
        console.log(`Total data in images field: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Average size per product: ${(totalSize / products.length / 1024).toFixed(2)} KB`);
        console.log(`Largest product: ${largestProduct} (${(largestImage / 1024).toFixed(2)} KB)`);
        
        if (totalSize > 10 * 1024 * 1024) {
            console.warn('\nWARNING: Total image data exceeds 10MB. This will significantly slow down getAllProducts responses!');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

checkImageSizes();
