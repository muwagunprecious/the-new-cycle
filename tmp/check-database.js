const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

// Simple .env parser
const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8')
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^"|"$/g, '')
        }
    })
}

const prisma = new PrismaClient()

async function main() {
    const stores = await prisma.store.findMany({
        include: {
            products: true,
            user: true
        }
    })

    console.log('STORES AND PRODUCTS REPORT:')
    stores.forEach(s => {
        console.log(`Store: ${s.name} (ID: ${s.id})`)
        console.log(`- Owner: ${s.user.name} (${s.user.email})`)
        console.log(`- Status: ${s.status}, Active: ${s.isActive}`)
        console.log(`- Products Count: ${s.products.length}`)
        s.products.forEach(p => {
            console.log(`  * [${p.id}] ${p.name} (${p.category})`)
        })
        console.log('-------------------')
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
