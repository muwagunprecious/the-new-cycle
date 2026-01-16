const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database with demo accounts...\n");

    try {
        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const sellerPassword = await bcrypt.hash('seller123', 10);
        const buyerPassword = await bcrypt.hash('buyer123', 10);

        // 1. Create Admin User
        console.log("Creating admin user...");
        const admin = await prisma.user.upsert({
            where: { email: 'admin@gmail.com' },
            update: {
                role: 'ADMIN',
                isEmailVerified: true,
                password: adminPassword
            },
            create: {
                id: 'user_admin_seed',
                email: 'admin@gmail.com',
                name: 'System Admin',
                password: adminPassword,
                role: 'ADMIN',
                image: '',
                isEmailVerified: true,
                cart: '{}'
            }
        });
        console.log("✅ Admin created:", admin.email);

        // 2. Create Seller User
        console.log("\nCreating seller user...");
        const seller = await prisma.user.upsert({
            where: { email: 'adebayo@ecovolt.com' },
            update: {
                role: 'SELLER',
                isEmailVerified: true,
                password: sellerPassword
            },
            create: {
                id: 'user_seller_seed',
                email: 'adebayo@ecovolt.com',
                name: 'Adebayo Ecovolt',
                password: sellerPassword,
                role: 'SELLER',
                image: '',
                phone: '08012345678',
                isEmailVerified: true,
                cart: '{}'
            }
        });
        console.log("✅ Seller created:", seller.email);

        // 3. Create Approved Store for Seller
        console.log("\nCreating approved store for seller...");
        const store = await prisma.store.upsert({
            where: { userId: seller.id },
            update: {
                status: 'approved',
                isActive: true,
                isVerified: true
            },
            create: {
                id: 'store_ecovolt_seed',
                userId: seller.id,
                name: 'EcoVolt Batteries',
                description: 'Premium recycled batteries in Lagos',
                username: 'ecovolt',
                address: '123 Ikeja Road, Lagos',
                status: 'approved',
                isActive: true,
                isVerified: true,
                logo: '',
                email: 'adebayo@ecovolt.com',
                contact: '08012345678'
            }
        });
        console.log("✅ Store created and approved:", store.name);

        // 4. Create Buyer User
        console.log("\nCreating buyer user...");
        const buyer = await prisma.user.upsert({
            where: { email: 'emeka@example.com' },
            update: {
                role: 'USER',
                isEmailVerified: true,
                password: buyerPassword
            },
            create: {
                id: 'user_buyer_seed',
                email: 'emeka@example.com',
                name: 'Emeka Okafor',
                password: buyerPassword,
                role: 'USER',
                image: '',
                phone: '08087654321',
                isEmailVerified: true,
                cart: '{}'
            }
        });
        console.log("✅ Buyer created:", buyer.email);

        console.log("\n✨ Database seeding completed successfully!\n");
        console.log("📝 Login credentials:");
        console.log("   Admin:  admin@gmail.com / admin123");
        console.log("   Seller: adebayo@ecovolt.com / seller123");
        console.log("   Buyer:  emeka@example.com / buyer123\n");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
