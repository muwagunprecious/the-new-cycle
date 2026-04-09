require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

console.log("Using DATABASE_URL:", process.env.DATABASE_URL);

// Use the standard pooled DATABASE_URL which connects fine for the application
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Adding isDirectorVerified to User...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDirectorVerified" BOOLEAN DEFAULT false;`);
        
        console.log("Adding isDirectorVerified to Store...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isDirectorVerified" BOOLEAN DEFAULT false;`);
        
        console.log("Columns added successfully!");
    } catch (err) {
        console.error("Failed to add columns:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
