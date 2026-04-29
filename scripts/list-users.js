const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const users = await p.user.findMany()
  console.log('All Users:', users.map(u => ({ id: u.id, email: u.email, phone: u.phone, role: u.role, name: u.name })))
  await p.$disconnect()
}

main().catch(e => {
  console.error('Error:', e)
  p.$disconnect()
})
