
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { ninDocument: { not: null } },
          { businessName: { not: null } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ninDocument: true,
        role: true
      }
    });

    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        nin: true,
        userId: true
      }
    });

    console.log("--- USERS WITH NIN ---");
    console.table(users.map(u => ({
      ID: u.id,
      Name: u.name,
      Phone: u.phone,
      Email: u.email || 'N/A',
      NIN: u.ninDocument || 'N/A',
      Role: u.role
    })));

    console.log("\n--- STORES WITH NIN ---");
    console.table(stores.map(s => ({
      ID: s.id,
      Name: s.name,
      NIN: s.nin || 'N/A',
      UserID: s.userId
    })));

  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
