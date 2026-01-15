const { PrismaClient } = require('@prisma/client')

const urls = [
    'postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require',
    'postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=no-verify',
    'postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require',
    'postgresql://postgres:IglooEstate2026%21@db.mrswfnmpmhbufhorutew.supabase.co:5432/postgres?sslmode=require'
]

async function test(url) {
    const prisma = new PrismaClient({
        datasources: { db: { url } }
    })
    try {
        console.log(`Testing Prisma URL: ${url.replace(/:.*@/, ':****@')}`)
        await prisma.$connect()
        console.log('  SUCCESS!')
    } catch (err) {
        console.log(`  FAIL: ${err.message.split('\n')[0]}`)
    } finally {
        await prisma.$disconnect()
    }
}

async function run() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    for (const url of urls) {
        await test(url)
    }
}

run()
