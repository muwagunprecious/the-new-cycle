
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function checkUser() {
    const prisma = new PrismaClient();
    try {
        const email = 'ademuwagun@gmail.com';
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            console.log('User found:');
            console.log(`- Email: ${user.email}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- Password hash exists: ${!!user.password}`);
            console.log(`- isEmailVerified: ${user.isEmailVerified}`);

            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log(`- Password "admin123" matches hash: ${isMatch}`);
        } else {
            console.log('User not found.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
