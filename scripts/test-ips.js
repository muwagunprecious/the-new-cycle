const { PrismaClient } = require('@prisma/client')

async function testIp(name, ip) {
    const url = `postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@${ip}:5432/postgres`
    console.log(`Testing ${name} (${ip})...`)
    const prisma = new PrismaClient({
        datasources: { db: { url } }
    })

    try {
        const start = Date.now()
        const count = await prisma.product.count()
        const duration = Date.now() - start
        console.log(`✅ ${name} SUCCESS: ${count} products in ${duration}ms`)
    } catch (e) {
        console.log(`❌ ${name} FAILED: ${e.message}`)
    } finally {
        await prisma.$disconnect()
    }
}

async function main() {
    await testIp('IP_1', '51.21.18.29')
    console.log('---')
    await testIp('IP_2', '13.60.102.132')
}

main()
