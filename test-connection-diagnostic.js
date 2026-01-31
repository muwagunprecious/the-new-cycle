
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
    console.log('Testing connection with DATABASE_URL from .env...');
    console.log('URL:', process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@')); // Hide password

    const prisma = new PrismaClient();

    try {
        const userCount = await prisma.user.count();
        console.log('Success! User count:', userCount);
    } catch (error) {
        console.error('Connection failed:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
