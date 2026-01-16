const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const stores = await prisma.store.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            }
        }
    });
    console.log('--- STORES ---');
    console.dir(stores, { depth: null });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
