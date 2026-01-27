const { Pool } = require('pg');

// Use connection pooling with aggressive timeouts
const pool = new Pool({
    connectionString: process.env.DIRECT_URL,
    max: 1,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000,
});

async function main() {
    let client;
    try {
        console.log("Attempting connection...");
        client = await pool.connect();
        console.log("✓ Connected!");

        console.log("Checking for existing column...");
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Product' AND column_name = 'collectionDates';
        `);

        if (checkResult.rows.length > 0) {
            console.log("✓ Column 'collectionDates' already exists!");
            return;
        }

        console.log("Adding column (this may take a moment)...");
        await client.query('ALTER TABLE "Product" ADD COLUMN "collectionDates" TEXT[] DEFAULT \'{}\';');
        console.log("✓ SUCCESS! Column 'collectionDates' added to Product table!");

    } catch (err) {
        console.error("✗ ERROR:", err.message);
        if (err.code) console.error("Error code:", err.code);
    } finally {
        if (client) client.release();
        await pool.end();
    }
}

main();
