const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
    const accounts = [
        { email: 'admin@gocycle.com', password: 'admin123' },
        { email: 'adebayo@ecovolt.com', password: 'seller123' },
        { email: 'buyer@gocycle.com', password: 'buyer123' }
    ];

    console.log("--- Password Validation Audit ---");
    for (const acc of accounts) {
        const user = await prisma.user.findUnique({ where: { email: acc.email } });
        if (!user) {
            console.log(`[MISSING] ${acc.email} not found in DB.`);
            continue;
        }

        const isMatch = await bcrypt.compare(acc.password, user.password);
        console.log(`[${isMatch ? 'VALID' : 'INVALID'}] ${acc.email} matched? ${isMatch}`);
        if (!isMatch) {
            console.log(`  Expected password: ${acc.password}`);
            console.log(`  Stored hash: ${user.password}`);
        }
    }

    process.exit(0);
}

check().catch(e => {
    console.error(e);
    process.exit(1);
});
