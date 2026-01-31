
const { PrismaClient } = require('@prisma/client');

async function checkPhoneNumbers() {
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                phone: true
            }
        });
        console.log('User Phone Status:');
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Email: ${u.email}, Phone: ${u.phone || 'NULL'}`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkPhoneNumbers();
