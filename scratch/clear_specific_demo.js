const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const demoIds = ['buyer_demo', 'admin_demo', 'seller_demo']
  
  console.log("Clearing data for specific demo IDs:", demoIds)
  
  for (const userId of demoIds) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { store: true }
    })
    
    if (!user) {
        console.log(`User ${userId} not found, skipping.`)
        continue
    }

    console.log(`Clearing: ${user.email} (${user.name})`)
    
    if (user.store) {
      const sellerOrders = await prisma.order.deleteMany({
        where: { storeId: user.store.id }
      })
      console.log(`- Deleted ${sellerOrders.count} orders (as seller)`)

      const productDelete = await prisma.product.deleteMany({
        where: { storeId: user.store.id }
      })
      console.log(`- Deleted ${productDelete.count} products`)
      
      await prisma.store.update({
          where: { id: user.store.id },
          data: { walletBalance: 0 }
      })
    }

    const buyerOrders = await prisma.order.deleteMany({
      where: { userId: user.id }
    })
    console.log(`- Deleted ${buyerOrders.count} orders (as buyer)`)
    
    await prisma.notification.deleteMany({
      where: { userId: user.id }
    })
    
    await prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: 0 }
    })
  }

  console.log("Cleanup complete.")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
