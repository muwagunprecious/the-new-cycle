const { Client } = require('pg');

const dbUrl = "postgresql://postgres.iatsetyqlzmukwvnkcio:%24%3FJ%3Fzy9RcKcR2Yp@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?sslmode=disable";

async function main() {
    const client = new Client({
        connectionString: dbUrl,
    });

    try {
        console.log("Connecting to the REAL LIVE DATABASE (iatsetyqlzmukwvnkcio) on port 6543 using pg...");
        await client.connect();

        // Force adding missing columns for Store
        console.log("Adding Store columns...");
        await client.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION DEFAULT 0');
        await client.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT');
        await client.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false');
        await client.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isDirectorVerified" BOOLEAN DEFAULT false');
        await client.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "nin" TEXT');
        await client.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "cac" TEXT');

        // Force adding missing columns for users
        console.log("Adding Users columns...");
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fullName" TEXT');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "ninDocument" TEXT');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cacDocument" TEXT');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isDirectorVerified" BOOLEAN DEFAULT false');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" TEXT');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lga" TEXT');
        await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "state" TEXT DEFAULT \'Lagos\'');
        
        // Remove NOT NULL from email if exists
        try {
            await client.query('ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL');
            console.log("Relaxed email constraint.");
        } catch (e) {
            console.log("Email constraint drop failed (might already be dropped), continuing...");
        }

        console.log("SUCCESS! All missing columns applied to the real live database.");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await client.end();
    }
}

main();
