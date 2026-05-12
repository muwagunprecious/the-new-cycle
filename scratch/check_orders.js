const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking last 5 orders in DB...");
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            user: { select: { id: true, name: true, phone: true } }
        }
    });

    console.log("Found Orders:");
    orders.forEach(o => {
        console.log(`- ID: ${o.id}, UserID: ${o.userId}, Name: ${o.user?.name}, Status: ${o.status}, Created: ${o.createdAt}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
