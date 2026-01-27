const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log("--- Starting Verification Flow Test ---")

    // 1. Create a dummy user
    const email = `seller_${Date.now()}@test.com`
    console.log(`Creating user: ${email}`)

    const user = await prisma.user.create({
        data: {
            id: `user_${Date.now()}`,
            name: "Test Seller",
            email: email,
            password: "hashed_password",
            role: "SELLER",
            image: "",
            cart: {}
        }
    })

    // 2. Create Store Application
    console.log("Creating store application...")
    const store = await prisma.store.create({
        data: {
            userId: user.id,
            name: "Test Battery Shop",
            username: `test_shop_${Date.now()}`,
            email: email,
            contact: "08012345678",
            description: "Selling batteries",
            address: "Lagos",
            logo: "",
            // Default status is 'pending', isActive: false
        }
    })

    console.log(`Store created. Status: ${store.status}, Active: ${store.isActive}`)

    if (store.status !== 'pending' || store.isActive !== false) {
        console.error("❌ FAIL: Initial store status should be pending/inactive")
        return
    }
    console.log("✅ PASS: Initial status is Pending")

    // 3. Admin Approval Simulation
    console.log("Simulating Admin Approval...")
    const updatedStore = await prisma.store.update({
        where: { id: store.id },
        data: { status: 'approved', isActive: true }
    })

    console.log(`Store Updated. Status: ${updatedStore.status}, Active: ${updatedStore.isActive}`)

    if (updatedStore.status === 'approved' && updatedStore.isActive === true) {
        console.log("✅ PASS: Store successfully approved")
    } else {
        console.error("❌ FAIL: Store approval failed")
    }

    // Cleanup
    await prisma.store.delete({ where: { id: store.id } })
    await prisma.user.delete({ where: { id: user.id } })
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
