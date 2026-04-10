
const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        
        console.log("--- FETCHING USERS WITH NIN ---");
        const userRes = await client.query('SELECT id, name, email, phone, "ninDocument", role FROM users WHERE "ninDocument" IS NOT NULL OR "businessName" IS NOT NULL');
        console.table(userRes.rows);

        console.log("\n--- FETCHING STORES WITH NIN ---");
        const storeRes = await client.query('SELECT id, name, nin, "userId" FROM "Store" WHERE nin IS NOT NULL');
        console.table(storeRes.rows);

    } catch (err) {
        console.error("Database connection error:", err.stack);
    } finally {
        await client.end();
    }
}

main();
