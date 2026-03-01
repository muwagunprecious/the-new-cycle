const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');

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
            password: password,
            role: 'ADMIN',
            image: '',
            isEmailVerified: true,
            phone: '08000000001'
        }
    });
    console.log("Admin seeded:", admin.email);
}

main()
    .catch((e) => {
        fs.writeFileSync('seed_full_err.txt', e.stack || e.message || String(e));
        console.log("Error written to seed_full_err.txt");
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
