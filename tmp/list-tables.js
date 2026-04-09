require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const res = await client.query(`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`);
        console.log("Tables:", res.rows.map(r => r.tablename));
    } catch (err) {
        console.error("Failed:", err);
    } finally {
        await client.end();
    }
}

main();
