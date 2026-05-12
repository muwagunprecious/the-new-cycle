const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Searching for demo accounts...")
  
  // Find users that look like demo accounts
  const demoUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: 'test' } },
        { email: { contains: 'demo' } },
        { name: { contains: 'Demo' } },
        { name: { contains: 'Test' } }
      ]
    },
    include: {
      store: true
    }
  })

  console.log(`Found ${demoUsers.length} potential demo users.`)
  
  for (const user of demoUsers) {
    console.log(`Clearing data for: ${user.email} (Role: ${user.role})`)
    
    // If it's a seller, delete products
    if (user.store) {
      const productDelete = await prisma.product.deleteMany({
        where: { storeId: user.store.id }
      })
      console.log(`Deleted ${productDelete.count} products for store: ${user.store.name}`)
    }

    // Delete orders where user is buyer
    const buyerOrders = await prisma.order.deleteMany({
      where: { userId: user.id }
    })
    console.log(`Deleted ${buyerOrders.count} orders where user was buyer.`)

    // Delete orders where user is seller (through store)
    if (user.store) {
      const sellerOrders = await prisma.order.deleteMany({
        where: { storeId: user.store.id }
      })
      console.log(`Deleted ${sellerOrders.count} orders where user was seller.`)
    }
    
    // Delete notifications
    const notifications = await prisma.notification.deleteMany({
      where: { userId: user.id }
    })
    console.log(`Deleted ${notifications.count} notifications.`)

    // Reset wallet balance if we are not deleting the user
    await prisma.user.update({
        where: { id: user.id },
        data: { walletBalance: 0 }
    })
    if (user.store) {
        await prisma.store.update({
            where: { id: user.store.id },
            data: { walletBalance: 0 }
        })
    }
  }

  console.log("Data clearing complete.")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
