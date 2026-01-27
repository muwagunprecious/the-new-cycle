const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error("Please provide an email: node scripts/check-seller.js <email>")
        return
    }

    console.log(`Checking account: ${email}`)

    const user = await prisma.user.findUnique({
        where: { email },
        include: { store: true }
    })

    if (!user) {
        console.error("User not found")
        return
    }

    console.log("--- User Info ---")
    console.log(`ID: ${user.id}`)
    console.log(`Role: ${user.role}`)

    if (user.store) {
        console.log("--- Store Info ---")
        console.log(`Status: ${user.store.status}`)
        console.log(`Is Active: ${user.store.isActive}`)
        console.log(`Is Verified: ${user.store.isVerified}`)
    } else {
        console.log("No store found for this user.")
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect())
