const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
let dbUrl = '';
envConfig.split('\n').forEach(line => {
    if (line.startsWith('DATABASE_URL=')) {
        dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
});

const client = new Client({ connectionString: dbUrl });

async function checkTables() {
    try {
        await client.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("Tables:", res.rows.map(r => r.table_name));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkTables();
