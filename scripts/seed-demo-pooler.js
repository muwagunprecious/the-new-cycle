const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable",
        },
    },
});

async function main() {
    console.log("Seeding demo data with alternative port...");

    const password = await bcrypt.hash('admin123', 10);
    const sellerPassword = await bcrypt.hash('seller123', 10);

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gocycle.com' },
        update: { role: 'ADMIN' },
        create: {
            id: 'admin_demo',
            email: 'admin@gocycle.com',
            name: 'Demo Admin',
            fullName: 'Demo Admin',
            password: password,
            role: 'ADMIN',
            image: '',
            isEmailVerified: true,
            phone: '08000000001'
        }
    });
    console.log("Admin seeded:", admin.email);

    // 2. Create Seller
    const seller = await prisma.user.upsert({
        where: { email: 'adebayo@ecovolt.com' },
        update: { role: 'SELLER' },
        create: {
            id: 'seller_demo',
            email: 'adebayo@ecovolt.com',
            name: 'Adebayo Ecovolt',
            fullName: 'Adebayo Ecovolt',
            password: sellerPassword,
            role: 'SELLER',
            image: '',
            isEmailVerified: true,
            phone: '08000000002'
        }
    });
    console.log("Seller seeded:", seller.email);

    // 3. Create Approved Store
    const store = await prisma.store.upsert({
        where: { userId: seller.id },
        update: { status: 'approved', isActive: true, isVerified: true },
        create: {
            id: 'store_demo',
            userId: seller.id,
            name: 'EcoVolt Batteries',
            description: 'Top quality recycled batteries in Lagos.',
            username: 'ecovolt',
            address: '123 Ikeja, Lagos',
            status: 'approved',
            isActive: true,
            isVerified: true,
            logo: '',
            email: 'adebayo@ecovolt.com',
            contact: '08012345678'
        }
    });
    console.log("Store seeded and approved for:", seller.email);

    console.log("Seed complete! You can now login as Adebayo (Seller).");
}

main()
    .catch((e) => {
        const fs = require('fs');
        fs.writeFileSync('seed_pooler_err.txt', e.stack || e.message || String(e));
        console.log("Error written to seed_pooler_err.txt");
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
