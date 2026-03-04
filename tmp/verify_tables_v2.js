const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
let dbUrl = '';
envConfig.split('\n').forEach(line => {
    if (line.startsWith('DIRECT_URL=')) {
        dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
});

const client = new Client({ connectionString: dbUrl });

async function check() {
    try {
        await client.connect();

        const tables = ['users', 'OrderItem', 'Rating', 'Product', 'Order', 'Store', 'Address', 'Notification'];
        for (const t of tables) {
            try {
                // Using double quotes for all because some are mixed case
                const res = await client.query('SELECT COUNT(*) FROM "' + t + '"');
                console.log('Table "' + t + '": EXISTS, Count: ' + res.rows[0].count);
            } catch (e) {
                console.log('Table "' + t + '": ERROR: ' + e.message);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
check();
