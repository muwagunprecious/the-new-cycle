const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Simple .env parser since dotenv is missing
function loadEnv() {
    try {
        const content = fs.readFileSync('.env', 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                let val = match[2].trim();
                if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
                process.env[match[1].trim()] = val;
            }
        });
    } catch (e) { }
}

async function verify() {
    loadEnv();
    console.log("Testing with DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
    if (!process.env.DATABASE_URL) return;

    const prisma = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } }
    });
    try {
        const count = await prisma.user.count();
        console.log("✅ SUCCESS: Found", count, "users.");
        fs.writeFileSync('scripts/verify_result.txt', "SUCCESS");
    } catch (e) {
        console.log("❌ FAILED:", e.message.split('\n')[0]);
        fs.writeFileSync('scripts/verify_result.txt', "FAILED: " + e.message);
    } finally {
        await prisma.$disconnect();
    }
}
verify();
