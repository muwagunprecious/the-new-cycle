import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

// Using the proven working connection string
const connectionString = 'postgresql://postgres.fbsmnlinkndqiiicpuet:66bL8Z0vCK31RR7W@aws-1-eu-west-1.pooler.supabase.com:5432/postgres';

async function setupDatabase() {
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔄 Connecting to database...');
        await client.connect();
        console.log('✅ Connected!');

        console.log('🔄 Reading schema SQL...');
        const sqlPath = path.join(process.cwd(), 'scripts', 'schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('🔄 Executing schema migration...');
        await client.query(sql);

        console.log('✅ Database schema synced successfully!');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Details:', error);
        throw error;
    } finally {
        await client.end();
    }
}

setupDatabase()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
