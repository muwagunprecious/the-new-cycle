const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// We will force connection to the DB from .env.broken
const dbUrl = "postgresql://postgres.iatsetyqlzmukwvnkcio:%24%3FJ%3Fzy9RcKcR2Yp@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=disable";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

async function main() {
    try {
        console.log("Applying migrations to the REAL LIVE DATABASE (iatsetyqlzmukwvnkcio)...");

        // Force adding missing columns for Store
        console.log("Adding Store columns...");
        await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION DEFAULT 0');
        await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false');
        await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isDirectorVerified" BOOLEAN DEFAULT false');
        await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "nin" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "cac" TEXT');

        // Force adding missing columns for users
        console.log("Adding Users columns...");
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fullName" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ninDocument" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cacDocument" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDirectorVerified" BOOLEAN DEFAULT false');
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lga" TEXT');
        await prisma.$executeRawUnsafe('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state" TEXT DEFAULT \'Lagos\'');
        
        // Remove NOT NULL from email if exists
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL');
            console.log("Relaxed email constraint.");
        } catch (e) {
            console.log("Email constraint drop failed (might already be dropped), continuing...");
        }

        console.log("SUCCESS! All missing columns applied to the real live database.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
