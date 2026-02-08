const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function verify() {
    console.log("Testing with DATABASE_URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:.*@/, ':****@') : "NOT SET");
    const prisma = new PrismaClient();
    try {
        const count = await prisma.user.count();
        console.log("✅ SUCCESS: Found", count, "users.");
    } catch (e) {
        console.log("❌ FAILED:", e.message.split('\n')[0]);
    } finally {
        await prisma.$disconnect();
    }
}
verify();
