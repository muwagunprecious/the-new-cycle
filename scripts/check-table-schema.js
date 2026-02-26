const { Client } = require('pg');

const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";

async function checkTableSchema(tableName) {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log(`Checking schema for table: ${tableName}`);

        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1
            ORDER BY ordinal_position;
        `, [tableName]);

        console.log("Columns:");
        res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));

        // Also check if Store exists (case-sensitive check)
        const storeRes = await client.query(`
            SELECT EXISTS (
               SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'Store'
            );
        `);
        console.log(`Does 'Store' exist? ${storeRes.rows[0].exists}`);

        const storeLowerRes = await client.query(`
            SELECT EXISTS (
               SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' 
               AND table_name = 'store'
            );
        `);
        console.log(`Does 'store' exist? ${storeLowerRes.rows[0].exists}`);

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await client.end();
    }
}

checkTableSchema('Product');
