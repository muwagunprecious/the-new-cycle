require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, phone: true, email: true, isPhoneVerified: true, isEmailVerified: true, createdAt: true }
    });
    console.log(`Total users in DB: ${users.length}\n`);
    users.forEach(u => {
        console.log(`ID: ${u.id}`);
        console.log(`  Name: ${u.name}`);
        console.log(`  Phone: ${u.phone}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  PhoneVerified: ${u.isPhoneVerified}`);
        console.log(`  EmailVerified: ${u.isEmailVerified}`);
        console.log(`  Created: ${u.createdAt}`);
        console.log('');
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
