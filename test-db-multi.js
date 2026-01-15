const { PrismaClient } = require('@prisma/client')

async function test(port) {
    const url = `postgresql://postgres.mrswfnmpmhbufhorutew:yEIyAjyYOEJZ8bmb@aws-1-eu-north-1.pooler.supabase.com:${port}/postgres${port === '6543' ? '?pgbouncer=true' : ''}`
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    })

    try {
        console.log(`Connecting to port ${port}...`)
        await prisma.$connect()
        console.log(`DB_OK on port ${port}`)
        process.exit(0)
    } catch (e) {
        console.log(`DB_ERR on port ${port}: ${e.message.split('\n')[0]}`)
    } finally {
        await prisma.$disconnect()
    }
}

async function run() {
    await test('5432')
    await test('6543')
}

run()
