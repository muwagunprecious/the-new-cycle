const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findVerifiedUser() {
    const target = "9023323399";
    console.log(`Checking for verified users containing: ${target}`);
    
    const allUsers = await prisma.user.findMany({
        where: {
            OR: [
                { isPhoneVerified: true },
                { isEmailVerified: true }
            ]
        },
        select: { id: true, name: true, phone: true, isPhoneVerified: true, isEmailVerified: true, email: true }
    });

    const matches = allUsers.filter(u => {
        const phoneClean = u.phone ? u.phone.replace(/\D/g, '') : "";
        return phoneClean.includes(target);
    });

    if (matches.length === 0) {
        console.log("No verified matches found.");
    } else {
        console.log(`Found ${matches.length} verified match(es):`);
        matches.forEach(u => {
            console.log(`- ID: ${u.id}, Name: ${u.name}, Phone: ${u.phone}, PhoneVerified: ${u.isPhoneVerified}, EmailVerified: ${u.isEmailVerified}, Email: ${u.email}`);
        });
    }
    await prisma.$disconnect();
}

findVerifiedUser().catch(console.error);
