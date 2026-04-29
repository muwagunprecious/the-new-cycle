const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()

async function main() {
  const users = await p.user.findMany({ where: { role: 'ADMIN' } })
  console.log('Admins:', users.map(u => ({ id: u.id, email: u.email, role: u.role })))
  await p.$disconnect()
}

main().catch(e => console.error(e))
