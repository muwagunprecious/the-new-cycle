const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const rawId = 'cmm8b9fol0001sw04gtxkjtw5';
    const quotedId = `'${rawId}'`;

    try {
        console.log('Checking raw ID:', rawId);
        const p1 = await prisma.product.findUnique({ where: { id: rawId } });
        console.log('Raw ID result:', p1 ? 'FOUND' : 'NOT FOUND');

        console.log('Checking quoted ID:', quotedId);
        const p2 = await prisma.product.findUnique({ where: { id: quotedId } });
        console.log('Quoted ID result:', p2 ? 'FOUND' : 'NOT FOUND');

        if (!p1 && !p2) {
            console.log('Searching for any product with ID containing:', rawId);
            const p3 = await prisma.product.findMany({
                where: { id: { contains: rawId } }
            });
            console.log('Partial match results:', p3.length);
            if (p3.length > 0) {
                p3.forEach(p => console.log(`  Found: "${p.id}" for "${p.name}"`));
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
