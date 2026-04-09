const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const targetPhone = "00923323399";
    console.log(`Searching for users with phone: ${targetPhone}...`);

    try {
        // Search for literal matches or normalized matches
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { phone: targetPhone },
                    { phone: "09023323399" }, // guessed normalization
                    { phone: "2349023323399" }
                ]
            }
        });

        if (users.length === 0) {
            console.log("No users found with that phone number.");
            return;
        }

        console.log(`Found ${users.length} user(s):`);
        users.forEach(u => console.log(`- ID: ${u.id}, Name: ${u.name}, Phone: ${u.phone}`));

        for (const user of users) {
             // Delete the user
             // Note: Depending on relations, we might need cascade or manual cleanup.
             // Store, Orders, etc.
             console.log(`Deleting user ${user.id}...`);
             await prisma.user.delete({ where: { id: user.id } });
             console.log(`✅ Deleted user ${user.id}`);
        }

    } catch (error) {
        console.error("Error deleting number:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
