const { PrismaClient } = require('@prisma/client')
// Direct URL for mrswfnmpmhbufhorutew
const url = 'postgresql://postgres:IglooEstate2026%21@db.mrswfnmpmhbufhorutew.supabase.co:5432/postgres'
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: url
        }
    }
})

async function main() {
    try {
        console.log('Testing DIRECT connection with Prisma...')
        await prisma.$connect()
        console.log('DIRECT_PRISMA_SUCCESS')
        const count = await prisma.user.count()
        console.log('User count:', count)
    } catch (err) {
        console.error('DIRECT_PRISMA_FAIL:', err.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
