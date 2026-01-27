const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@gmail.com'
    const password = 'admin123'
    const name = 'System Admin'

    const hashedPassword = await bcrypt.hash(password, 10)

    console.log("Connecting to database...")
    try {
        await prisma.$connect()
        console.log("Connected! seeding admin...")
    } catch (err) {
        console.error("Explicit connect failed:", err)
        throw err;
    }

    const user = await prisma.user.upsert({
        where: { email: email },
        update: {
            role: 'ADMIN',
            password: hashedPassword // Update password in case it changed
        },
        create: {
            id: 'user_admin_seed',
            email: email,
            name: name,
            password: hashedPassword,
            role: 'ADMIN',
            image: '',
            cart: {}
        }
    })

    console.log({ user })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
