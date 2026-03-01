const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";

async function addFullName() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log("Connected to database. Adding fullName column...");

        const sqlPath = path.join(__dirname, 'add-fullname.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log("Success: fullName column added!");
    } catch (err) {
        console.error("Error executing SQL:", err.message);
    } finally {
        await client.end();
    }
}

addFullName();
