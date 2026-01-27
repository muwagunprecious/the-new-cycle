const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Listing all stores and associated users...")
    const stores = await prisma.store.findMany({
        include: { user: true }
    })

    stores.forEach(s => {
        console.log(`Email: ${s.user.email} | Role: ${s.user.role} | Store: ${s.name} | Status: ${s.status}`)
    })
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
