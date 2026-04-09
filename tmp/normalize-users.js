require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizePhone(phone) {
    if (!phone) return "";
    let formatted = phone.replace(/\D/g, '');
    if (formatted.startsWith('0') && formatted.length === 11) {
        formatted = '234' + formatted.substring(1);
    } else if (formatted.startsWith('234')) {
        // already has prefix
    } else if (formatted.length === 10) {
        formatted = '234' + formatted;
    }
    return formatted;
}

async function main() {
    console.log("Starting phone number normalization...");
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        if (!user.phone) continue;

        const normalized = normalizePhone(user.phone);
        if (normalized !== user.phone) {
            console.log(`Updating user ${user.id} (${user.name}): ${user.phone} -> ${normalized}`);
            try {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { phone: normalized }
                });
            } catch (error) {
                if (error.code === 'P2002') {
                    console.warn(`Conflict detected for normalized phone ${normalized}. Handling...`);
                    // If conflict, check if this is a "Prospective User" and the existing one is real
                    const duplicate = await prisma.user.findFirst({ where: { phone: normalized } });
                    if (user.name === "Prospective User" && duplicate && duplicate.name !== "Prospective User") {
                        console.log(`Deleting redundant prospective user ${user.id}`);
                        await prisma.user.delete({ where: { id: user.id } });
                    } else if (duplicate && duplicate.name === "Prospective User" && user.name !== "Prospective User") {
                        console.log(`Deleting redundant prospective user ${duplicate.id} and updating current user`);
                        await prisma.user.delete({ where: { id: duplicate.id } });
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { phone: normalized }
                        });
                    } else {
                        console.error(`Unresolvable conflict for ${normalized} between ${user.id} and ${duplicate?.id}`);
                    }
                } else {
                    console.error(`Failed to update user ${user.id}:`, error);
                }
            }
        }
    }

    console.log("Normalization complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
