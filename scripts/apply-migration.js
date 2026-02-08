const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL || process.env.DATABASE_URL
        }
    }
});

async function main() {
    try {
        console.log("Applying migrations using:", process.env.DIRECT_URL ? "DIRECT_URL" : "DATABASE_URL");

        // Check if columns already exist
        const columns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Store' AND column_name IN ('walletBalance', 'rejectionReason')
    `;

        const existingColumns = columns.map(c => c.column_name);

        if (!existingColumns.includes('walletBalance')) {
            console.log("Adding walletBalance column...");
            await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN "walletBalance" DOUBLE PRECISION DEFAULT 0');
        } else {
            console.log("walletBalance column already exists.");
        }

        if (!existingColumns.includes('rejectionReason')) {
            console.log("Adding rejectionReason column...");
            await prisma.$executeRawUnsafe('ALTER TABLE "Store" ADD COLUMN "rejectionReason" TEXT');
        } else {
            console.log("rejectionReason column already exists.");
        }

        console.log("Migrations applied successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
