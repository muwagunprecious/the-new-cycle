const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable"
        }
    }
});

async function main() {
    try {
        console.log("Checking for missing columns in 'Store' table...");

        // Check walletBalance
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION DEFAULT 0');
            console.log("Successfully checked/added 'walletBalance' column.");
        } catch (e) {
            console.log("'walletBalance' check skipped (already exists or error):", e.message);
        }

        // Check rejectionReason
        try {
            await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT');
            console.log("Successfully checked/added 'rejectionReason' column.");
        } catch (e) {
            console.log("'rejectionReason' check skipped (already exists or error):", e.message);
        }

        console.log("Migration check completed.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
