const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 'seller_demo' }
  })
  if (user) {
    console.log("Found seller_demo:")
    console.log(JSON.stringify(user, null, 2))
  } else {
    console.log("seller_demo NOT found.")
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
