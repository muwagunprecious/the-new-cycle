const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const products = await prisma.product.findMany({
            take: 10,
            select: { id: true, name: true }
        });

        console.log(`Found ${products.length} products total.`);
        products.forEach((p, i) => {
            console.log(`[${i}] ID: "${p.id}" (Length: ${p.id.length}) - Name: "${p.name}"`);
            // Check for hidden characters
            for (let j = 0; j < p.id.length; j++) {
                const charCode = p.id.charCodeAt(j);
                if (charCode < 32 || charCode > 126) {
                    console.log(`  Warning: Non-printable character at index ${j}: Code ${charCode}`);
                }
            }
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
