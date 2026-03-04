const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking database...");
    const user = await prisma.user.findFirst({
        where: { email: 'buyer@gocycle.com' }
    });
    if (user) {
        console.log(`User ID: ${user.id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Account Status: ${user.accountStatus}`);
        console.log(`NIN: ${user.ninDocument ? 'Present' : 'Missing'}`);
    } else {
        console.log("No user found with email buyer@gocycle.com");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
