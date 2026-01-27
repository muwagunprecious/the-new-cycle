const { Client } = require('pg');
const connectionString = process.env.DIRECT_URL;

async function main() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'Product' AND column_name = 'collectionDates';
        `);

        if (res.rows.length > 0) {
            console.log("✓ Column 'collectionDates' EXISTS in Product table");
        } else {
            console.log("✗ Column 'collectionDates' NOT FOUND in Product table");
        }
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
}

main();
