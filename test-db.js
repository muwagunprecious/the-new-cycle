const { PrismaClient } = require('@prisma/client')
const url = "postgresql://postgres.mrswfnmpmhbufhorutew:GocycleAfrica123@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: url
        }
    }
})

async function test() {
    try {
        console.log("Attempting to connect to:", url.replace(/:.*@/, ":****@"))
        await prisma.$connect()
        console.log("DB Connection SUCCESS")
        const count = await prisma.user.count()
        console.log("User count:", count)
    } catch (e) {
        console.error("DB Connection FAILED:", e.message)
    } finally {
        await prisma.$disconnect()
    }
}

test()
