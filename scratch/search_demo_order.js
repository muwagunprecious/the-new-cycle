const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const order = await prisma.order.findFirst({
    where: { 
        OR: [
            { id: { contains: 'DEMO' } },
            { transactionId: { contains: 'DEMO' } }
        ]
    }
  })
  if (order) {
    console.log("Found order with DEMO in ID:")
    console.log(JSON.stringify(order, null, 2))
  } else {
    console.log("No orders found with DEMO in ID.")
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
