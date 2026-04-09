require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find all Prospective User records
    const prospective = await prisma.user.findMany({
        where: {
            OR: [
                { name: "Prospective User" },
                { fullName: "Prospective User" },
                { email: { startsWith: "temp_", endsWith: "@placeholder.com" } }
            ]
        },
        select: { id: true, name: true, phone: true, email: true, isPhoneVerified: true }
    });

    console.log(`Found ${prospective.length} Prospective User records:`);
    prospective.forEach(u => console.log(`  - ${u.id} | phone: ${u.phone} | verified: ${u.isPhoneVerified} | email: ${u.email}`));

    if (prospective.length > 0) {
        const deleted = await prisma.user.deleteMany({
            where: {
                id: { in: prospective.map(u => u.id) }
            }
        });
        console.log(`\nDeleted ${deleted.count} Prospective User records.`);
    } else {
        console.log("No cleanup needed.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
