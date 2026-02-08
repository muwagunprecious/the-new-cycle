// Use dynamic import or require to ensure .env is pick up if the client uses it
require('dotenv').config();
const prisma = require('../backend/lib/prisma').default;

async function verify() {
    console.log("Environment DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");
    try {
        console.log("Attempting to count users using app's Prisma client...");
        const count = await prisma.user.count();
        console.log("✅ SUCCESS: User count is", count);
    } catch (error) {
        console.error("❌ FAILED: Could not connect using app's Prisma client.");
        console.error("Error:", error.message.split('\n')[0]);

        // If it fails with "connect.supabase.com", it means the environment wasn't reloaded
        if (error.message.includes("connect.supabase.com")) {
            console.log("Note: It seems the client is still trying to use the OLD connection string.");
        }
    } finally {
        // We don't want to disconnect if the global prisma is used in a way that matters, 
        // but for a script it's fine.
        if (prisma && prisma.$disconnect) await prisma.$disconnect();
    }
}

verify();
