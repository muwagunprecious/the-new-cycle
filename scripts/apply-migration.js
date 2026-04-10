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
        console.log("Applying comprehensive migrations using:", process.env.DIRECT_URL ? "DIRECT_URL" : "DATABASE_URL");

        // --- STORE TABLE UPDATES ---
        console.log("Checking Store table columns...");
        const storeColumns = await prisma.$queryRaw`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'Store'
        `;
        const existingStoreCols = storeColumns.map(c => c.column_name);

        const storeMigrations = [
            { name: 'walletBalance', sql: 'ALTER TABLE "Store" ADD COLUMN "walletBalance" DOUBLE PRECISION DEFAULT 0' },
            { name: 'rejectionReason', sql: 'ALTER TABLE "Store" ADD COLUMN "rejectionReason" TEXT' },
            { name: 'isVerified', sql: 'ALTER TABLE "Store" ADD COLUMN "isVerified" BOOLEAN DEFAULT false' },
            { name: 'isDirectorVerified', sql: 'ALTER TABLE "Store" ADD COLUMN "isDirectorVerified" BOOLEAN DEFAULT false' },
            { name: 'nin', sql: 'ALTER TABLE "Store" ADD COLUMN "nin" TEXT' },
            { name: 'cac', sql: 'ALTER TABLE "Store" ADD COLUMN "cac" TEXT' }
        ];

        for (const m of storeMigrations) {
            if (!existingStoreCols.includes(m.name)) {
                console.log(`Adding ${m.name} to Store...`);
                await prisma.$executeRawUnsafe(m.sql);
            }
        }

        // --- USERS TABLE UPDATES ---
        console.log("Checking users table columns...");
        const userColumns = await prisma.$queryRaw`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users'
        `;
        const existingUserCols = userColumns.map(c => c.column_name);

        const userMigrations = [
            { name: 'firstName', sql: 'ALTER TABLE "users" ADD COLUMN "firstName" TEXT' },
            { name: 'lastName', sql: 'ALTER TABLE "users" ADD COLUMN "lastName" TEXT' },
            { name: 'fullName', sql: 'ALTER TABLE "users" ADD COLUMN "fullName" TEXT' },
            { name: 'ninDocument', sql: 'ALTER TABLE "users" ADD COLUMN "ninDocument" TEXT' },
            { name: 'cacDocument', sql: 'ALTER TABLE "users" ADD COLUMN "cacDocument" TEXT' },
            { name: 'gender', sql: 'ALTER TABLE "users" ADD COLUMN "gender" TEXT' },
            { name: 'state', sql: 'ALTER TABLE "users" ADD COLUMN "state" TEXT DEFAULT \'Lagos\'' },
            { name: 'lga', sql: 'ALTER TABLE "users" ADD COLUMN "lga" TEXT' },
            { name: 'isDirectorVerified', sql: 'ALTER TABLE "users" ADD COLUMN "isDirectorVerified" BOOLEAN DEFAULT false' },
            { name: 'verificationNotes', sql: 'ALTER TABLE "users" ADD COLUMN "verificationNotes" TEXT' },
            { name: 'verificationCode', sql: 'ALTER TABLE "users" ADD COLUMN "verificationCode" TEXT' },
            { name: 'verifiedAt', sql: 'ALTER TABLE "users" ADD COLUMN "verifiedAt" TIMESTAMP WITH TIME ZONE' },
            { name: 'identityToken', sql: 'ALTER TABLE "users" ADD COLUMN "identityToken" TEXT' },
            { name: 'businessToken', sql: 'ALTER TABLE "users" ADD COLUMN "businessToken" TEXT' }
        ];

        for (const m of userMigrations) {
            if (!existingUserCols.includes(m.name)) {
                console.log(`Adding ${m.name} to users...`);
                await prisma.$executeRawUnsafe(m.sql);
            }
        }

        console.log("All migrations applied successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
