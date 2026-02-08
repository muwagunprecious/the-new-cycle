const { Client } = require('pg');

const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable";

async function migrate() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log("Connected to database via pg.");

        console.log("Adding walletBalance...");
        try {
            await client.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION DEFAULT 0');
            console.log("walletBalance added or already exists.");
        } catch (e) {
            console.error("Error adding walletBalance:", e.message);
        }

        console.log("Adding rejectionReason...");
        try {
            await client.query('ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT');
            console.log("rejectionReason added or already exists.");
        } catch (e) {
            console.error("Error adding rejectionReason:", e.message);
        }

        console.log("Migration successful.");
    } catch (err) {
        console.error("Connection error:", err.stack);
    } finally {
        await client.end();
    }
}

migrate();
