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

if (!dbUrl) {
    console.error("DIRECT_URL not found in .env");
    process.exit(1);
}

const client = new Client({ connectionString: dbUrl });

async function cleanup() {
    console.log("Starting Cleanup with DIRECT_URL...");
    try {
        await client.connect();
        console.log("Connected to DB.");

        // Re-read emails to be absolutely sure
        const demoEmailsCsv = "'admin@gocycle.com','adebayo@ecovolt.com','buyer@gocycle.com'";

        const tables = ['"OrderItem"', '"Rating"', '"Notification"', '"Order"', '"Address"', '"Product"', '"Store"'];

        // We need to delete in order of dependencies or disable constraints (riskier)
        // Let's do it in order:
        // OrderItem -> Order -> Rating -> Notification -> Address -> Product -> Store -> users

        console.log("Clearing OrderItem...");
        await client.query('DELETE FROM "OrderItem"');

        console.log("Clearing Rating...");
        await client.query('DELETE FROM "Rating"');

        console.log("Clearing Order...");
        await client.query('DELETE FROM "Order"');

        console.log("Clearing Notification...");
        await client.query('DELETE FROM "Notification"');

        console.log("Clearing non-demo Address...");
        await client.query(`DELETE FROM "Address" WHERE "userId" NOT IN (SELECT id FROM users WHERE email IN (${demoEmailsCsv}))`);

        console.log("Clearing non-demo Product...");
        await client.query(`DELETE FROM "Product" WHERE "sellerId" NOT IN (SELECT id FROM users WHERE email = 'adebayo@ecovolt.com')`);

        console.log("Clearing non-demo Store...");
        await client.query(`DELETE FROM "Store" WHERE "userId" NOT IN (SELECT id FROM users WHERE email = 'adebayo@ecovolt.com')`);

        console.log("Clearing non-demo users...");
        await client.query(`DELETE FROM users WHERE email NOT IN (${demoEmailsCsv})`);

        console.log("SUCCESS: Cleanup complete.");

    } catch (err) {
        console.error("ERROR:", err.message);
        // If it fails on a specific table, maybe it's lowercase?
        if (err.message.includes('does not exist')) {
            console.log("Table name case issue suspected, attempting lowercase...");
            // fallback logic or just log it
        }
    } finally {
        await client.end();
    }
}

cleanup();
