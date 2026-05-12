const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const orderId = "GCY-6EVVJ8W" // The most recent PAID order
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'COMPLETED',
      collectionStatus: 'COLLECTED',
      payoutStatus: 'pending'
    }
  })
  console.log("Updated Order:", updated.id, "Status:", updated.status, "Payout:", updated.payoutStatus)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
