
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createDemoSeller() {
    const prisma = new PrismaClient();
    const phone = '+234 800-000-0001';
    const email = 'demo@gocycle.com';
    const password = 'password123';

    try {
        console.log('--- Creating Demo Seller ---');

        // Cleanup if exists
        await prisma.user.deleteMany({ where: { phone } });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create User
        const user = await prisma.user.create({
            data: {
                id: 'demo_seller_' + Date.now().toString(36),
                name: 'Demo Battery Seller',
                email: email,
                phone: phone,
                password: hashedPassword,
                image: '',
                role: 'SELLER',
                isPhoneVerified: true,
                isEmailVerified: true,
                cart: '{}'
            }
        });
        console.log('User created:', user.id);

        // 2. Create Approved Store
        const store = await prisma.store.create({
            data: {
                id: 'demo_store_' + Date.now().toString(36),
                name: 'SafeRecycle Batteries',
                username: 'saferecycle_demo',
                description: 'Authorized battery recycling and sales center.',
                address: '10 Industrial Way, Ikeja, Lagos',
                email: email,
                contact: phone,
                logo: '',
                status: 'approved',
                isActive: true,
                isVerified: true,
                userId: user.id
            }
        });
        console.log('Store created and approved:', store.id);

        console.log('\n--- LOGIN DETAILS ---');
        console.log('Identifier (Phone):', phone);
        console.log('Identifier (Email):', email);
        console.log('Password:', password);
        console.log('----------------------');

    } catch (error) {
        console.error('Failed to create demo seller:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createDemoSeller();
