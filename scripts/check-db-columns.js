const { Client } = require('pg');
require('dotenv').config();

async function checkColumns() {
    const client = new Client({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
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
            // Check if it's case sensitive or mapped differently
            const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`);
            console.log('Available tables:', tables.rows.map(r => r.table_name).join(', '));
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
