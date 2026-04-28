import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log("Fetching all blogs...")
  const blogs = await prisma.blog.findMany()
  
  let updatedCount = 0

  for (const blog of blogs) {
    if (blog.headlineImage && blog.headlineImage.includes('unsplash.com')) {
      console.log(`Fixing blog ${blog.id}...`)
      await prisma.blog.update({
        where: { id: blog.id },
        data: { headlineImage: '' } // Wipe the broken remote images
      })
      updatedCount++
    }
  }

  console.log(`Successfully fixed ${updatedCount} blogs in the database!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
