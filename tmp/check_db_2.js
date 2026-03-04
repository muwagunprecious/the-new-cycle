const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ select: { email: true, role: true } });
    const products = await prisma.product.findMany({ select: { name: true, sellerId: true } });
    console.log("Users:", users);
    console.log("Products:", products);
}

main().finally(() => prisma.$disconnect());
