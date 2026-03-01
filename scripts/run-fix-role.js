const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";

async function fixRole() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log("Connected to database. Fixing role column type...");

        const sqlPath = path.join(__dirname, 'fix-role-type.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log("Success: role column type fixed!");
    } catch (err) {
        console.error("Error executing SQL:", err.message);
    } finally {
        await client.end();
    }
}

fixRole();
