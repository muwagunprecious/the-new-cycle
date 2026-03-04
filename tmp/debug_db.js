const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
    const products = await prisma.product.findMany({ select: { id: true, name: true, sellerId: true } });
    console.log(JSON.stringify({ users, products }, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
