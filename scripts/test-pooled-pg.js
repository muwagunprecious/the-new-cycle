const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function testConnection() {
    console.log("Testing PG connection to:", connectionString.replace(/:.*@/, ":****@"));
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 10000,
    });

    try {
        await client.connect();
        console.log("✓ PG Connection SUCCESS!");
        const res = await client.query('SELECT NOW()');
        console.log("✓ Query result:", res.rows[0]);
    } catch (err) {
        console.error("✗ PG Connection FAILED:", err.message);
        if (err.code) console.error("Error code:", err.code);
    } finally {
        await client.end();
    }
}

testConnection();
