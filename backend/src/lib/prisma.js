const { PrismaClient } = require('@prisma/client')

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton()

module.exports = prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
