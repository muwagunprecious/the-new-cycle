const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: { role: 'USER' },
        select: { id: true, name: true, email: true, accountStatus: true, phone: true }
    });
    console.log("Registered Buyers:", JSON.stringify(users, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
