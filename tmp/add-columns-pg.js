require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log("Connected directly via pg library.");
        
        console.log("Adding isDirectorVerified to User...");
        await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isDirectorVerified" BOOLEAN DEFAULT false;`);
        
        console.log("Adding isDirectorVerified to Store...");
        await client.query(`ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "isDirectorVerified" BOOLEAN DEFAULT false;`);
        
        console.log("Columns added successfully!");
    } catch (err) {
        console.error("Failed:", err);
    } finally {
        await client.end();
    }
}

main();
