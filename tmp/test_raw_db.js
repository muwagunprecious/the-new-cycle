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

console.log("Connecting to:", dbUrl.replace(/:[^:]*@/, ':****@'));

const client = new Client({
    connectionString: dbUrl,
});

async function test() {
    try {
        await client.connect();
        console.log("Connected successfully!");
        const res = await client.query('SELECT 1');
        console.log("Result:", res.rows);
    } catch (err) {
        console.error("Connection error:", err);
    } finally {
        await client.end();
    }
}

test();
