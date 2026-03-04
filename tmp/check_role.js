const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'buyer@gocycle.com' }
    });
    if (user) {
        console.log("User found:");
        console.log(`ID: ${user.id}`);
        console.log(`Role: ${user.role}`);
        console.log(`Account Status: ${user.accountStatus}`);
    } else {
        console.log("User not found");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
