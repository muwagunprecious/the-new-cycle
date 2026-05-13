const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'ademuwagunmayokun@gmail.com';
    const user = await prisma.user.findFirst({
        where: { email },
        include: {
            buyerOrders: {
                include: {
                    orderItems: {
                        include: {
                            product: true
                        }
                    },
                    store: true
                }
            }
        }
    });

    if (!user) {
        console.log('User not found');
        return;
    }

    console.log('User:', JSON.stringify(user, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
