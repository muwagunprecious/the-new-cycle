
const { Client } = require('pg');

async function main() {
    const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require";
    console.log('Testing connection with pg client...');

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false // Common fix for SSL issues on local dev
        }
    });

    try {
        await client.connect();
        console.log('Success! Connected with pg client.');
        const res = await client.query('SELECT NOW()');
        console.log('Server time:', res.rows[0]);
    } catch (error) {
        console.error('Connection failed with pg:');
        console.error(error.message);
    } finally {
        await client.end();
    }
}

main();
