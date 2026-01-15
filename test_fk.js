const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("--- TEST START ---")
    const fakeUserId = "non_existent_user_" + Date.now()
    try {
        console.log("Attempting to create store for user:", fakeUserId)
        await prisma.store.create({
            data: {
                name: "Test Store",
                description: "Desc",
                address: "Addr",
                userId: fakeUserId,
                email: "test@test.com",
                username: "test_store_" + Date.now(),
                contact: "123",
                logo: "",
                status: 'pending'
            }
        })
        console.log("SUCCESS: Store created (Unexpected)")
    } catch (e) {
        console.log("ERROR CAUGHT:", e.code, e.message)
    }
    console.log("--- TEST END ---")
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
