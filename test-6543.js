const { PrismaClient } = require('@prisma/client')
const url = "postgresql://postgres.mrswfnmpmhbufhorutew:yEIyAjyYOEJZ8bmb@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
const prisma = new PrismaClient({
    datasources: { db: { url } }
})
async function test() {
    try {
        await prisma.$connect()
        console.log("DB_SUCCESS_6543")
        const count = await prisma.user.count()
        console.log("USER_COUNT:", count)
    } catch (e) {
        console.log("DB_FAIL_6543", e.message)
    } finally {
        await prisma.$disconnect()
    }
}
test()
