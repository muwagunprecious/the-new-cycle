const { Client } = require('pg');

const config = {
    connectionString: "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
    ssl: {
        rejectUnauthorized: false // Allow self-signed/Supabase certs
    }
};

async function testSSL() {
    console.log("Testing SSL connection to Supabase pooler (6543)...");
    const client = new Client(config);
    try {
        await client.connect();
        console.log("[SUCCESS] SSL Connection established!");
        const res = await client.query('SELECT NOW()');
        console.log("Query result:", res.rows[0]);
    } catch (err) {
        console.error("[FAILURE] SSL Connection failed:", err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        await client.end();
    }
}

testSSL();
