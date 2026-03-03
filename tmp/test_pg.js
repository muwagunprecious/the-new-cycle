const { Client } = require('pg');

async function testConnection(url, name) {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        console.log(`[SUCCESS] Connected to ${name}`);
        const res = await client.query('SELECT NOW()');
        console.log(`  Time:`, res.rows[0]);
    } catch (err) {
        console.error(`[ERROR] Failed to connect to ${name}:`, err.message);
    } finally {
        await client.end().catch(() => { });
    }
}

async function main() {
    const directUrl = "postgresql://postgres.owrvuvowerbkgswkorio:FVa5jOVCCenTzBn3@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable";
    const poolerUrl = "postgresql://postgres.owrvuvowerbkgswkorio:FVa5jOVCCenTzBn3@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=disable&pgbouncer=true&connection_limit=10";

    await testConnection(directUrl, "Direct URL (5432)");
    await testConnection(poolerUrl, "Pooler URL (6543)");
}

main();
