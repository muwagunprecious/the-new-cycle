const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findUserComprehensive() {
    const target = "9023323399";
    console.log(`Searching for phone containing: ${target}`);
    
    const allUsers = await prisma.user.findMany({
        select: { id: true, name: true, phone: true, isPhoneVerified: true, email: true }
    });

    const matches = allUsers.filter(u => {
        if (!u.phone) return false;
        const clean = u.phone.replace(/\D/g, '');
        return clean.includes(target);
    });

    if (matches.length === 0) {
        console.log("No matches found.");
    } else {
        console.log(`Found ${matches.length} match(es):`);
        matches.forEach(u => {
            console.log(`- ID: ${u.id}, Name: ${u.name}, Phone: ${u.phone}, Verified: ${u.isPhoneVerified}, Email: ${u.email}`);
        });
    }
    await prisma.$disconnect();
}

findUserComprehensive().catch(console.error);
