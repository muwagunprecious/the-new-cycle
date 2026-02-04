const { Client } = require('pg');

async function checkSchema() {
    const client = new Client({
        connectionString: "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:5432/postgres",
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
      SELECT table_schema, table_name
      FROM information_schema.tables 
      WHERE table_name = 'users';
    `);

        console.log('TABLES_FOUND:');
        res.rows.forEach(r => {
            console.log(`- ${r.table_schema}.${r.table_name}`);
        });

        const columns = await client.query(`
      SELECT table_schema, column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'name';
    `);

        console.log('NAME_COLUMN_FOUND_IN:');
        columns.rows.forEach(c => {
            console.log(`- ${c.table_schema}.${c.column_name}`);
        });

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkSchema();
