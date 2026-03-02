const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log("Seeding demo data...");

    const password = await bcrypt.hash('admin123', 10);
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const buyerPassword = await bcrypt.hash('buyer123', 10);

    // 1. Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gocycle.com' },
        update: { role: 'ADMIN' },
        create: {
            id: 'admin_demo',
            email: 'admin@gocycle.com',
            name: 'Demo Admin',
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
            password: sellerPassword,
            role: 'SELLER',
            image: '',
            isEmailVerified: true,
            phone: '08000000002'
        }
    });
    console.log("Seller seeded:", seller.email);

    // 3. Create Buyer
    const buyer = await prisma.user.upsert({
        where: { email: 'buyer@gocycle.com' },
        update: { role: 'USER' },
        create: {
            id: 'buyer_demo',
            email: 'buyer@gocycle.com',
            name: 'Demo Buyer',
            password: buyerPassword,
            role: 'USER',
            image: '',
            isEmailVerified: true,
            phone: '08000000003'
        }
    });
    console.log("Buyer seeded:", buyer.email);

    // 3. Create Approved Store for Seller
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

    // 4. Create Sample Product
    const product = await prisma.product.upsert({
        where: { id: 'cmm8b9fol0001sw04gtxkjtw5' },
        update: { inStock: true, quantity: 5 },
        create: {
            id: 'cmm8b9fol0001sw04gtxkjtw5',
            name: "Scrap Inverter Batt (Dry cell) (100Ah) - Apapa",
            description: "Verified scrap inverter battery. High lead content, ready for recycling.",
            mrp: 35000,
            price: 30000,
            images: ["/placeholder-battery.jpg"],
            category: "Battery",
            type: 'INVERTER_DRY',
            brand: "EcoVolt",
            amps: 100,
            condition: "SCRAP",
            pickupAddress: "Apapa, Lagos",
            collectionDateStart: new Date(),
            collectionDateEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            collectionDates: [new Date().toISOString().split('T')[0]],
            quantity: 5,
            storeId: store.id,
            inStock: true
        }
    });
    console.log("Sample product seeded:", product.name);

    console.log("Seed complete! You can now see verified listings on the marketplace.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
