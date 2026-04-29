const { loginUser } = require('./backend-actions/actions/auth')
const prisma = require('./backend-actions/lib/prisma')

async function test() {
    const res = await loginUser('admin@gocycle.com', 'admin123')
    console.log('Login Result:', JSON.stringify(res, null, 2))
    await prisma.$disconnect()
}

test()
