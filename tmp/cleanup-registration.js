const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_PHONE = '2349023323399'; // The number being blocked

async function cleanupProspectiveUsers(phone) {
    console.log(`Cleaning up registration blockers for phone: ${phone}`);
    
    // Find users with this phone number
    const users = await prisma.user.findMany({
        where: { phone },
        select: { id: true, name: true, phone: true, isPhoneVerified: true }
    });

    if (users.length === 0) {
        console.log("No records found for this phone number.");
        return;
    }

    console.log(`Found ${users.length} record(s):`);
    for (const user of users) {
        console.log(`- ID: ${user.id}, Name: ${user.name}, Verified: ${user.isPhoneVerified}`);
        
        // Only delete if NOT fully verified, or as requested by the user
        if (!user.isPhoneVerified || user.name === "Prospective User") {
            console.log(`  Deleting record ${user.id}...`);
            await prisma.user.delete({ where: { id: user.id } });
            console.log("  Successfully deleted.");
        } else {
            console.log(`  [SKIPPING] Record ${user.id} is a verified user. Manual deletion required if this is intended.`);
        }
    }
}

cleanupProspectiveUsers(TARGET_PHONE)
    .catch(console.error)
    .finally(() => prisma.$disconnect());
