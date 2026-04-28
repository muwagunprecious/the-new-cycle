import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.time('DB Query Time')
  const products = await prisma.product.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' }
  })
  console.timeEnd('DB Query Time')

  const jsonString = JSON.stringify(products)
  const mb = Buffer.byteLength(jsonString, 'utf8') / 1024 / 1024

  console.log(`Payload size: ${mb.toFixed(2)} MB`)

  // How many base64 strings in total?
  let base64Count = 0
  products.forEach(p => {
    if (p.images && Array.isArray(p.images)) {
        p.images.forEach(img => {
            if (img.startsWith('data:image')) {
                base64Count++
            }
        })
    }
  })
  console.log(`Total Base64 images found: ${base64Count}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
