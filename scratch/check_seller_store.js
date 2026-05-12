const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const store = await prisma.store.findUnique({
    where: { userId: 'seller_demo' }
  })
  if (store) {
    console.log("Found store for seller_demo:")
    console.log(JSON.stringify(store, null, 2))
    
    const orders = await prisma.order.findMany({
        where: { storeId: store.id }
    })
    console.log(`Found ${orders.length} orders for this store.`)
  } else {
    console.log("No store found for seller_demo.")
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
