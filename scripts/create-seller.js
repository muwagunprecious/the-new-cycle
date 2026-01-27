const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
    console.log("Seeding Demo Seller...")

    const email = 'seller@gmail.com'
    const password = await bcrypt.hash('seller123', 10)

    // 1. Create User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password,
            role: 'SELLER'
        },
        create: {
            id: 'user_seller_demo',
            name: "Demo Seller",
            email,
            password,
            role: 'SELLER',
            image: "",
            cart: {},
            isEmailVerified: true
        }
    })
    console.log(`User created/updated: ${user.email}`)

    // 2. Create Store
    const store = await prisma.store.upsert({
        where: { userId: user.id },
        update: {
            status: 'approved',
            isActive: true
        },
        create: {
            userId: user.id,
            name: "Demo Battery Store",
            username: "demo_store",
            email: email,
            contact: "08099887766",
            description: "The best demo batteries in town",
            address: "123 Demo Street, Lagos",
            logo: "",
            status: 'approved',
            isActive: true
        }
    })
    console.log(`Store created/updated: ${store.name} (Status: ${store.status})`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => await prisma.$disconnect())
