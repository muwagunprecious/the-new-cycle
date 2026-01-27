const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const count = await prisma.product.count()
    console.log("Total Products in DB:", count)

    if (count > 0) {
        const latest = await prisma.product.findFirst({
            orderBy: { createdAt: 'desc' }
        })
        console.log("Latest Product Created At:", latest.createdAt)
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
