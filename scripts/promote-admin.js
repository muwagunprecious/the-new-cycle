const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const email = "professorprecious03@gmail.com"
  
  // Find the user
  const user = await p.user.findUnique({ where: { email } })
  
  if (user) {
    if (user.role !== 'ADMIN') {
      const updated = await p.user.update({
        where: { email },
        data: { role: 'ADMIN' }
      })
      console.log('Updated user to ADMIN:', updated.email)
    } else {
      console.log('User is already ADMIN:', user.email)
    }
  } else {
    console.log('User not found:', email)
  }
  
  await p.$disconnect()
}

main().catch(e => {
  console.error('Error:', e)
  p.$disconnect()
})
