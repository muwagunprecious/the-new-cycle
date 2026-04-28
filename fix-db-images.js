import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Fetching all products...")
  const products = await prisma.product.findMany()
  
  let updatedCount = 0

  for (const product of products) {
    if (product.images && Array.isArray(product.images)) {
      const hasUnsplash = product.images.some(img => typeof img === 'string' && img.includes('unsplash.com'))
      
      if (hasUnsplash) {
        console.log(`Fixing product ${product.id}...`)
        await prisma.product.update({
          where: { id: product.id },
          data: { images: [] } // Wipe the broken remote images
        })
        updatedCount++
      }
    }
  }

  console.log(`Successfully fixed ${updatedCount} products in the database!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
