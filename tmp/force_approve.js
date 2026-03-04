const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Forcing approval for buyer_demo...");
    const user = await prisma.user.update({
        where: { email: 'buyer@gocycle.com' },
        data: {
            accountStatus: 'approved',
            verifiedAt: new Date(),
            isPhoneVerified: true,
            isEmailVerified: true,
            ninDocument: '70123456789', // Test NIN
            bankName: 'Test Bank',
            accountNumber: '1234567890',
            accountName: 'Demo Buyer'
        }
    });
    console.log("Update successful:");
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Account Status: ${user.accountStatus}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
