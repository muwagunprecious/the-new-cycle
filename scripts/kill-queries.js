const { Client } = require('pg');
const connectionString = process.env.DIRECT_URL;

async function main() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log("Killing queries running for more than 1 minute...");
        const res = await client.query(`
            SELECT pg_terminate_backend(pid), query, now() - query_start as duration
            FROM pg_stat_activity
            WHERE state != 'idle' 
              AND pid != pg_backend_pid()
              AND now() - query_start > interval '30 seconds';
        `);

        if (res.rows.length === 0) {
            console.log("No long-running queries found.");
        } else {
            console.log(`Killed ${res.rows.length} queries.`);
            res.rows.forEach(r => console.log(`- Killed: ${r.query} (Duration: ${r.duration})`));
        }
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
}

main();
