const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const store = await prisma.store.findFirst({
        where: { email: 'seller@gmail.com' }
    })
    console.log("Seller Store Details:", store)
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
