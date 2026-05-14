const { PrismaClient } = require('@prisma/client');
// Using direct connection to bypass pooler issues
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.qamfxfzxicraepxdncqd:IglooEstate2026!@db.qamfxfzxicraepxdncqd.supabase.co:5432/postgres"
    },
  },
});

async function deleteUserByEmail(email) {
  try {
    console.log(`[DB] Attempting to delete user with email: ${email}`);
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!user) {
      console.log(`[DB] No user found with email: ${email}`);
      // Try case-insensitive just in case
      const userCaseInsensitive = await prisma.user.findFirst({
        where: { email: { equals: email, mode: 'insensitive' } }
      });
      
      if (userCaseInsensitive) {
        console.log(`[DB] Found user with matching email (case-insensitive): ${userCaseInsensitive.email}. Deleting...`);
        const deleted = await prisma.user.delete({
          where: { id: userCaseInsensitive.id }
        });
        console.log(`[DB] Successfully deleted user: ${deleted.name} (${deleted.id})`);
      }
      return;
    }

    const deleted = await prisma.user.delete({
      where: { id: user.id }
    });
    
    console.log(`[DB] Successfully deleted user: ${deleted.name} (${deleted.id})`);
  } catch (error) {
    console.error(`[DB] Error deleting user:`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Perform deletions
(async () => {
  await deleteUserByEmail('Emmanuel@mobilemoneyafrica.com');
  await deleteUserByEmail('emmanuel@mobilemoneyafrica.com');
})();
