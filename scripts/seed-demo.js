const fs = require('fs');
const path = require('path');

// Manual .env loading (don't rely on dotenv package)
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key] = value;
        }
    });
}
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL, // pooler URL (port 6543)
        },
    },
});

async function main() {
    console.log("Starting DB Cleanup...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "FOUND" : "NOT FOUND");

    // 0. Identify Demo Users to protect
    const demoEmails = ['admin@gocycle.com', 'adebayo@ecovolt.com', 'buyer@gocycle.com'];

    console.log("Fetching existing seller ID for email: adebayo@ecovolt.com ...");
    // Get seller ID specifically for product protection
    const existingSeller = await prisma.user.findUnique({ where: { email: 'adebayo@ecovolt.com' } });
    console.log("Existing seller found:", !!existingSeller);
    const sellerId = existingSeller?.id || 'seller_demo';
    console.log("Using Seller ID:", sellerId);

    // 1. Delete all non-demo products
    console.log("Counting non-demo products...");
    try {
        const deletedProductsCount = await prisma.product.count({
            where: {
                OR: [
                    { store: { userId: { notIn: [sellerId] } } },
                    { store: { email: { notIn: demoEmails } } }
                ],
                // Protect hardcoded ID from seed script
                id: { not: 'cmm8b9fol0001sw04gtxkjtw5' }
            }
        });
        console.log("Counted:", deletedProductsCount);
    } catch (e) {
        console.log("Error counting products (might be empty):", e.message);
    }

    console.log("Clearing orders, orderItems, ratings, and notifications...");
    await prisma.orderItem.deleteMany({});
    await prisma.rating.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.notification.deleteMany({});
    console.log("Cleared all orders, orderItems, ratings, and notifications.");

    console.log("Deleting non-demo products...");
    const deletedProducts = await prisma.product.deleteMany({
        where: {
            OR: [
                { store: { userId: { notIn: [sellerId] } } },
                { store: { email: { notIn: demoEmails } } }
            ],
            // Protect hardcoded ID from seed script
            id: { not: 'cmm8b9fol0001sw04gtxkjtw5' }
        }
    });
    console.log(`Deleted ${deletedProducts.count} non-demo products.`);

    // 3. Delete all non-demo users
    const deletedUsers = await prisma.user.deleteMany({
        where: { email: { notIn: demoEmails } }
    });
    console.log(`Deleted ${deletedUsers.count} non-demo users.`);

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
        update: { role: 'USER', isEmailVerified: true },
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
