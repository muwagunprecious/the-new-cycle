const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("Patching existing products...")
    const products = await prisma.product.findMany()

    for (const product of products) {
        if (!product.collectionDates || product.collectionDates.length === 0) {
            const start = product.collectionDateStart.toISOString().split('T')[0]
            const end = product.collectionDateEnd.toISOString().split('T')[0]

            const dates = start === end ? [start] : [start, end]

            await prisma.product.update({
                where: { id: product.id },
                data: { collectionDates: dates }
            })
            console.log(`Patched product ${product.id} with dates: ${dates}`)
        }
    }
    console.log("Patching complete.")
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
