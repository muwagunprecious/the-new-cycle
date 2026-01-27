const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Setting Demo Seller to Pending status...")

    const email = 'seller@gmail.com'

    // Find User
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        console.error("Seller not found")
        return
    }

    // Update Store
    const store = await prisma.store.update({
        where: { userId: user.id },
        data: {
            status: 'pending',
            isActive: false
        }
    })

    console.log(`Store set to PENDING: ${store.name}`)
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
