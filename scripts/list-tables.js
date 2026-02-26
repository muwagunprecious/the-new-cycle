const { Client } = require('pg');

const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";

async function listTables() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log("Connected! Listing public tables...");

        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log("Tables found:");
        res.rows.forEach(row => console.log(`- ${row.table_name}`));

    } catch (err) {
        console.error("Error listing tables:", err.message);
    } finally {
        await client.end();
    }
}

listTables();
