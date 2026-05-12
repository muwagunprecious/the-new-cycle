const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const orders = await prisma.order.findMany({
        where: { userId: 'seller_demo' },
        include: { store: true }
    })
    console.log(JSON.stringify(orders, null, 2))
    await prisma.$disconnect()
}

main()
