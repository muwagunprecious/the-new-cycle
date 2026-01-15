const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("--- DEBUG START ---")
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true } })
    console.log('Users:', JSON.stringify(users, null, 2))

    const stores = await prisma.store.findMany({ select: { id: true, name: true, userId: true, status: true } })
    console.log('Stores:', JSON.stringify(stores, null, 2))
    console.log("--- DEBUG END ---")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
