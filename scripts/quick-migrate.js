const { Client } = require('pg');

const connectionString = process.env.DIRECT_URL;

async function main() {
    console.log("Quick migration attempt...");
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 30000,
        query_timeout: 60000,
        statement_timeout: 60000
    });

    try {
        await client.connect();
        console.log("Connected!");

        // Check if column exists first
        const checkResult = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Product' AND column_name = 'collectionDates';
        `);

        if (checkResult.rows.length > 0) {
            console.log("Column 'collectionDates' already exists!");
        } else {
            console.log("Adding column...");
            await client.query('ALTER TABLE "Product" ADD COLUMN "collectionDates" TEXT[];');
            console.log("✓ Column added successfully!");
        }
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
}

main();
