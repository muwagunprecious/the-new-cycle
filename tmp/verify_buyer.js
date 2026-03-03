const { PrismaClient } = require('@prisma/client');

// Use the pooler URL (port 6543) which works from this machine
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres.owrvuvowerbkgswkorio:FVa5jOVCCenTzBn3@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=disable&pgbouncer=true"
        }
    }
});

async function patch() {
    console.log("Patching buyer account to verified...");
    const result = await prisma.user.upsert({
        where: { email: 'buyer@gocycle.com' },
        update: { isEmailVerified: true },
        create: {
            id: 'buyer_demo',
            email: 'buyer@gocycle.com',
            name: 'Demo Buyer',
            password: require('bcryptjs').hashSync('buyer123', 10),
            role: 'USER',
            image: '',
            isEmailVerified: true,
            phone: '08000000003'
        }
    });
    console.log("Done! Buyer verified:", result.email, "| isEmailVerified:", result.isEmailVerified);
    await prisma.$disconnect();
}

patch().catch(e => { console.error(e); process.exit(1); });
