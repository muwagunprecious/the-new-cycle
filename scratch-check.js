const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ include: { store: true } });
    console.log(JSON.stringify(users, null, 2));
    const products = await prisma.product.findMany();
    console.log('Total Products:', products.length);
    console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
