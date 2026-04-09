const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        await prisma.user.create({
            data: {
                id: 'test_' + Date.now(),
                phone: '+2348000000010',
                verificationCode: '123456',
                name: 'Test',
                image: '',
                role: 'USER',
                isPhoneVerified: false
            }
        });
        console.log('✅ Created mock user successfully');
        await prisma.user.delete({ where: { phone: '+2348000000010' } });
    } catch(e) {
        console.error('THROWN:', e);
    }
    await prisma.$disconnect();
}
run();
