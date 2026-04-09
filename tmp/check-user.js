const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    console.log("Searching for user with phone: 2349023323399 or 09023323399");
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { phone: "2349023323399" },
                { phone: "09023323399" },
                { name: { contains: "Prospective" } }
            ]
        }
    });

    if (users.length === 0) {
        console.log("No users found with those details.");
    } else {
        console.log(`Found ${users.length} user(s):`);
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Name: ${u.name}, Phone: ${u.phone}, Verified: ${u.isPhoneVerified}, Email: ${u.email}`);
        });
    }
    await prisma.$disconnect();
}

checkUser().catch(err => {
    console.error(err);
    process.exit(1);
});
