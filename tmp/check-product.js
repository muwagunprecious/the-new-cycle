const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const productId = 'cmm8b9fol0001sw04gtxkjtw5';
    try {
        console.log('Fetching product:', productId);
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                store: {
                    select: { name: true, address: true, isVerified: true, logo: true, status: true }
                }
            }
        });

        if (product) {
            console.log('Product Found:', JSON.stringify(product, null, 2));
        } else {
            console.log('Product NOT FOUND in database.');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
