const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const orders = await prisma.order.findMany({
        where: {
            verificationCode: null
        }
    })
    console.log(`Found ${orders.length} orders without verification codes.`)
    
    for (const order of orders) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase()
        await prisma.order.update({
            where: { id: order.id },
            data: { verificationCode: code }
        })
        console.log(`Updated order ${order.id} with code ${code}`)
    }
    console.log('Backfill complete.')
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
