const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log("Starting full database cleanup...")

  // Delete in order of dependencies to avoid FK constraints
  const n0 = await prisma.notification.deleteMany({})
  console.log(`Deleted ${n0.count} notifications.`)

  const n1 = await prisma.orderItem.deleteMany({})
  console.log(`Deleted ${n1.count} order items.`)

  const n2 = await prisma.order.deleteMany({})
  console.log(`Deleted ${n2.count} orders.`)

  const n3 = await prisma.product.deleteMany({})
  console.log(`Deleted ${n3.count} products.`)

  const n4 = await prisma.store.deleteMany({})
  console.log(`Deleted ${n4.count} stores.`)

  // Delete all users except for maybe a super admin if one exists, 
  // but the user wants a clean environment.
  // We'll keep the admin accounts but clear their data if any.
  const n5 = await prisma.user.deleteMany({
    where: {
      role: { in: ['USER', 'SELLER'] }
    }
  })
  console.log(`Deleted ${n5.count} users (USER and SELLER roles).`)

  // Reset wallet balance for admins
  await prisma.user.updateMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    data: { walletBalance: 0 }
  })
  console.log("Reset admin wallet balances to 0.")

  console.log("Database cleanup complete.")
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
