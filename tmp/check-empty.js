const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEmptyFields() {
    console.log("Checking for users with empty or null email/phone...");
    
    const emptyEmail = await prisma.user.findMany({
        where: { OR: [{ email: "" }, { email: null }] },
        select: { id: true, name: true, email: true, phone: true, isPhoneVerified: true, isEmailVerified: true }
    });

    console.log(`Found ${emptyEmail.length} users with empty/null email:`);
    emptyEmail.forEach(u => {
        console.log(`- ID: ${u.id}, Name: ${u.name}, Email: '${u.email}', Phone: '${u.phone}', PhoneVerified: ${u.isPhoneVerified}, EmailVerified: ${u.isEmailVerified}`);
    });

    const emptyPhone = await prisma.user.findMany({
        where: { OR: [{ phone: "" }, { phone: null }] },
        select: { id: true, name: true, email: true, phone: true, isPhoneVerified: true, isEmailVerified: true }
    });

    console.log(`\nFound ${emptyPhone.length} users with empty/null phone:`);
    emptyPhone.forEach(u => {
        console.log(`- ID: ${u.id}, Name: ${u.name}, Email: '${u.email}', Phone: '${u.phone}', PhoneVerified: ${u.isPhoneVerified}, EmailVerified: ${u.isEmailVerified}`);
    });

    await prisma.$disconnect();
}

checkEmptyFields().catch(console.error);
