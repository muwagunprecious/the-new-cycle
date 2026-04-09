const { PrismaClient } = require('@prisma/client');

// Use DIRECT_URL from .env if possible, otherwise rely on the pooler
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=no-verify" 
    }
  }
});

async function debugUsers() {
    console.log("--- DEBUGGING ALL USERS ---");
    try {
        const users = await prisma.user.findMany({
            select: { 
                id: true, 
                name: true, 
                email: true, 
                phone: true, 
                isPhoneVerified: true, 
                isEmailVerified: true,
                role: true 
            }
        });

        console.log(`Found ${users.length} total users.`);
        users.forEach(u => {
            console.log(`[${u.role}] ID: ${u.id} | Name: ${u.name} | Email: '${u.email}' | Phone: '${u.phone}' | P-Ver: ${u.isPhoneVerified} | E-Ver: ${u.isEmailVerified}`);
        });

        console.log("\n--- SEARCHING FOR EMPTY/PREFIX PHONES ---");
        const suspicious = users.filter(u => !u.phone || u.phone === "" || u.phone === "+234 " || u.phone === "+234");
        console.log(`Found ${suspicious.length} suspicious records.`);
        suspicious.forEach(u => {
            console.log(`!!! MATCH !!! ID: ${u.id} | Phone: '${u.phone}' | Verified: ${u.isPhoneVerified || u.isEmailVerified}`);
        });

    } catch (err) {
        console.error("Database query failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

debugUsers();
