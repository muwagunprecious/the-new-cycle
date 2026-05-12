const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("Checking User details...");
    const users = await prisma.user.findMany({
        where: {
            OR: [
                { id: 'admin_demo' },
                { name: { contains: 'Ademuwagun' } }
            ]
        },
        select: { id: true, name: true, email: true, role: true }
    });

    console.log("Found Users:");
    users.forEach(u => {
        console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
