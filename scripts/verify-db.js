
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
});

async function main() {
    console.log('Attempting to connect to database...');
    try {
        await prisma.$connect();
        console.log('Successfully connected to database!');
        const userCount = await prisma.user.count();
        console.log(`Connection verified. Found ${userCount} users.`);
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
