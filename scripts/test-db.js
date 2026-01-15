const fs = require('fs');
const path = require('path');

const prismaClientPath = path.resolve('node_modules/@prisma/client');
console.log('Checking @prisma/client at:', prismaClientPath);

if (!fs.existsSync(prismaClientPath)) {
    console.error('ERROR: @prisma/client does not exist!');
    process.exit(1);
}

try {
    const { PrismaClient } = require('@prisma/client');
    console.log('Successfully required @prisma/client');

    const prisma = new PrismaClient({
        log: ['query', 'info', 'warn', 'error'],
    });

    async function main() {
        try {
            console.log('Connecting to database...');
            await prisma.$connect();
            console.log('Connected successfully.');

            const userCount = await prisma.user.count();
            console.log(`User count: ${userCount}`);

            const admin = await prisma.user.findFirst({
                where: { role: 'ADMIN' }
            });
            console.log('Admin user found:', admin ? admin.email : 'None');

        } catch (e) {
            console.error('Prisma Operation Error:', e);
            process.exit(1);
        } finally {
            await prisma.$disconnect();
        }
    }

    main();

} catch (e) {
    console.error('Require Error:', e);
    process.exit(1);
}
