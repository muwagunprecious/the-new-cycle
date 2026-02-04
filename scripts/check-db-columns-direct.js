const { Client } = require('pg');

async function checkColumns() {
    const client = new Client({
        connectionString: "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable",
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);

        if (res.rows.length === 0) {
            console.log('Table "users" not found!');
        } else {
            console.log('Columns in "users" table:');
            res.rows.forEach(row => {
                console.log(`- ${row.column_name}: ${row.data_type}`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkColumns();
