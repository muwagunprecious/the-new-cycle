const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testConcurrency() {
    console.log("Starting concurrency test (10 parallel queries)...")
    try {
        const results = await Promise.all(
            Array.from({ length: 10 }).map((_, i) => {
                console.log(`Query ${i + 1} starting...`)
                return prisma.user.count()
            })
        )
        console.log("Success! All queries completed.")
        console.log("Results (counts):", results)
    } catch (error) {
        console.error("FAILED Concurrency Test!")
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

testConcurrency()
