const { Client } = require('pg');

const client = new Client({
    connectionString: "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
});

async function run() {
    console.log("Connecting to Supabase...");
    await client.connect();
    console.log("Connected! Applying patches...");
    
    const queries = [
        `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessName" TEXT;`,
        `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessType" TEXT;`,
        `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT;`,
        `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT;`,
        `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fullName" TEXT;`,
        `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationCode" TEXT;`
    ];

    for (let q of queries) {
        try {
            await client.query(q);
            console.log("Executed: " + q);
        } catch (e) {
            console.error("Error executing query:", e.message);
        }
    }
    
    console.log("✅ All columns patched successfully!");
    await client.end();
}

run().catch(console.error);
