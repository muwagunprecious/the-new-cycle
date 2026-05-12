const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const orders = await prisma.order.findMany({
    where: { userId: 'buyer_demo' },
    include: { orderItems: true }
  })
  console.log(`Found ${orders.length} orders for buyer_demo`)
  console.log(JSON.stringify(orders, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
