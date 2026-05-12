const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const order = await prisma.order.findUnique({
        where: { id: 'GCY-5LN7ARB' }
    });
    console.log("Order Detail:", JSON.stringify(order, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
