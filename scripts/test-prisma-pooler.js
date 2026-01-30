const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('Attempting to connect to Prisma...');
        const count = await prisma.user.count();
        console.log('SUCCESS: Prisma connected!');
        console.log('User count:', count);
    } catch (error) {
        console.error('FAILED Prisma connection:');
        console.error(error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
