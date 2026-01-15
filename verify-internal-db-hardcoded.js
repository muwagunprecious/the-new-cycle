const { PrismaClient } = require('@prisma/client')
const url = 'postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require'
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: url
        }
    }
})

async function main() {
    try {
        console.log('Attempting Prisma connect with hardcoded URL...')
        await prisma.$connect()
        console.log('INTERNAL_DB_SUCCESS_HARDCODED')
        const count = await prisma.user.count()
        console.log('count =', count)
    } catch (err) {
        console.error('INTERNAL_DB_FAIL_HARDCODED:', err.message)
    } finally {
        await prisma.$disconnect()
    }
}

main()
