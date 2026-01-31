
const { Client } = require('pg');

async function main() {
    const url = "postgresql://postgres.mrswfnmpmhbufhorutew:IglooEstate2026%21@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
    console.log('Testing connection with pg client (no Prisma dependency)...');

    const client = new Client({
        connectionString: url,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('SUCCESS: Connected to the new database!');
        const res = await client.query('SELECT current_database(), current_user');
        console.log('Info:', res.rows[0]);
    } catch (error) {
        console.error('FAILED:', error.message);
    } finally {
        await client.end();
    }
}

main();
