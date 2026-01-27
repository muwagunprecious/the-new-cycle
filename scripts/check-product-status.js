const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Checking products and their store status...")
    const products = await prisma.product.findMany({
        include: {
            store: true
        }
    })

    console.log(`Total Products found: ${products.length}`)

    products.forEach((p, i) => {
        console.log(`[${i + 1}] Product: ${p.name}`)
        console.log(`    Store: ${p.store.name}`)
        console.log(`    Status: ${p.store.status}`)
        console.log(`    Is Active: ${p.store.isActive}`)
    })
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
