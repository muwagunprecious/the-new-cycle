const { PrismaClient } = require('@prisma/client')
// Postgresql connection string with the new password
const url = "postgresql://postgres.mrswfnmpmhbufhorutew:yEIyAjyYOEJZ8bmb@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: url
        }
    }
})

async function test() {
    try {
        console.log("Attempting to connect to Supabase...")
        await prisma.$connect()
        console.log("DB_OK - Connection successful!")
        const userCount = await prisma.user.count()
        console.log("Found", userCount, "users in the database.")
    } catch (e) {
        console.log("DB_ERR")
        console.log(e.message)
    } finally {
        await prisma.$disconnect()
        process.exit(0)
    }
}

test()
