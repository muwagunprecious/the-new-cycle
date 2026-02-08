const { Client } = require('pg');

const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable";

async function clearLocks() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log("Connected to database.");

        console.log("Checking for active locks on 'Store' table...");
        const res = await client.query(`
            SELECT pid, state, query, age(now(), query_start) as age
            FROM pg_stat_activity
            WHERE query ILIKE '%Store%' AND state != 'idle' AND pid != pg_backend_pid();
        `);

        if (res.rows.length > 0) {
            console.log(`Found ${res.rows.length} active queries that might be locking 'Store'.`);
            for (const row of res.rows) {
                console.log(`Killing PID ${row.pid} (Age: ${row.age}): ${row.query}`);
                await client.query(`SELECT pg_terminate_backend(${row.pid})`);
            }
        } else {
            console.log("No active locks found.");
        }

    } catch (err) {
        console.error("Error:", err.stack);
    } finally {
        await client.end();
    }
}

clearLocks();
