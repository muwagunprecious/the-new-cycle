const { PrismaClient } = require('@prisma/client')

const passwords = ["GocycleAfrica123@", "GocycleAfrica123"]
const ports = ["5432", "6543"]
const host = "aws-1-eu-north-1.pooler.supabase.com"
const user = "postgres.mrswfnmpmhbufhorutew"

async function runTests() {
    for (const pass of passwords) {
        for (const port of ports) {
            const encodedPass = pass.replace(/@/g, '%40')
            const url = `postgresql://${user}:${encodedPass}@${host}:${port}/postgres`
            console.log(`Testing: ${user}:****@${host}:${port}`)

            const prisma = new PrismaClient({
                datasources: { db: { url } }
            })

            try {
                // Use a short timeout
                await Promise.race([
                    prisma.$connect(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
                ])
                console.log(`>> SUCCESS: ${port} with password ending in ${pass.slice(-1)}`)
                await prisma.$disconnect()
                return
            } catch (e) {
                console.log(`>> FAILED: ${e.message.split('\n')[0]}`)
            } finally {
                await prisma.$disconnect()
            }
        }
    }
}

runTests()
