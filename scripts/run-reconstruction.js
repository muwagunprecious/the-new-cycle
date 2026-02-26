const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";

async function runReconstruction() {
    const client = new Client({
        connectionString: connectionString,
    });

    try {
        await client.connect();
        console.log("Connected to database. Reading SQL script...");

        const sqlPath = path.join(__dirname, 'reconstruct-db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Executing SQL...");
        await client.query(sql);
        console.log("Success: Database schema reconstructed successfully!");

    } catch (err) {
        console.error("Error executing SQL:", err.message);
        if (err.detail) console.error("Detail:", err.detail);
        if (err.where) console.error("Where:", err.where);
    } finally {
        await client.end();
    }
}

runReconstruction();
