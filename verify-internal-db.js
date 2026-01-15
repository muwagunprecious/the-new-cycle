const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const count = await prisma.user.count()
        console.log('INTERNAL_DB_SUCCESS: count =', count)
    } catch (err) {
        console.error('INTERNAL_DB_FAIL:', err.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
