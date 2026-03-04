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

async function cleanup() {
    try {
        await client.connect();
        console.log("Connected to DB.");

        const demoEmails = ["'admin@gocycle.com'", "'adebayo@ecovolt.com'", "'buyer@gocycle.com'"];
        const demoEmailsCsv = demoEmails.join(',');

        // 1. Clear dependent data
        console.log("Clearing OrderItems...");
        await client.query('DELETE FROM "OrderItem"');

        console.log("Clearing Ratings...");
        await client.query('DELETE FROM "Rating"');

        console.log("Clearing Notifications...");
        await client.query('DELETE FROM "Notification"');

        console.log("Clearing Orders...");
        await client.query('DELETE FROM "Order"'); // Trying "Order" (quoted)

        // 2. Clear Addresses for non-demo users
        console.log("Clearing non-demo Addresses...");
        await client.query(`
            DELETE FROM "Address" 
            WHERE "userId" NOT IN (SELECT id FROM users WHERE email IN (${demoEmailsCsv}))
        `);

        // 3. Clear non-demo Products
        console.log("Clearing non-demo Products...");
        await client.query(`
            DELETE FROM "Product" 
            WHERE "sellerId" NOT IN (SELECT id FROM users WHERE email = 'adebayo@ecovolt.com')
        `);

        // 4. Clear non-demo Stores
        console.log("Clearing non-demo Stores...");
        await client.query(`
            DELETE FROM "Store" 
            WHERE "userId" NOT IN (SELECT id FROM users WHERE email = 'adebayo@ecovolt.com')
        `);

        // 5. Clear non-demo Users
        console.log("Clearing non-demo Users...");
        await client.query(`
            DELETE FROM users 
            WHERE email NOT IN (${demoEmailsCsv})
        `);

        console.log("Cleanup SUCCESSFUL!");

    } catch (err) {
        console.error("Cleanup FAILED:", err.message);
        console.log("Full error for debug:", err);
    } finally {
        await client.end();
    }
}

cleanup();
