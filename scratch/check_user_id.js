const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'adebayo@ecovolt.com' },
        select: { id: true, email: true, phone: true }
    })
    console.log(user)
    await prisma.$disconnect()
}

main()
