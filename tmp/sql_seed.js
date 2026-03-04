const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
let dbUrl = '';
envConfig.split('\n').forEach(line => {
    if (line.startsWith('DIRECT_URL=')) {
        dbUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
});

const client = new Client({ connectionString: dbUrl });

async function seed() {
    console.log("Starting Direct SQL Seed...");
    try {
        await client.connect();

        const passwordHash = await bcrypt.hash('admin123', 10);
        const sellerHash = await bcrypt.hash('seller123', 10);
        const buyerHash = await bcrypt.hash('buyer123', 10);

        // 1. Seed Users
        console.log("Seeding Users...");

        // Admin
        await client.query(\`
            INSERT INTO users (id, name, email, password, image, role, "isEmailVerified", phone)
            VALUES ('admin_demo', 'Demo Admin', 'admin@gocycle.com', '\${passwordHash}', '', 'ADMIN', true, '08000000001')
            ON CONFLICT (id) DO UPDATE SET role = 'ADMIN'
        \`);

        // Seller
        await client.query(\`
            INSERT INTO users (id, name, email, password, image, role, "isEmailVerified", phone)
            VALUES ('seller_demo', 'Adebayo Ecovolt', 'adebayo@ecovolt.com', '\${sellerHash}', '', 'SELLER', true, '08000000002')
            ON CONFLICT (id) DO UPDATE SET role = 'SELLER'
        \`);

        // Buyer
        await client.query(\`
            INSERT INTO users (id, name, email, password, image, role, "isEmailVerified", phone, "accountStatus")
            VALUES ('buyer_demo', 'Demo Buyer', 'buyer@gocycle.com', '\${buyerHash}', '', 'USER', true, '08000000003', 'approved')
            ON CONFLICT (id) DO UPDATE SET role = 'USER', "accountStatus" = 'approved'
        \`);

        // 2. Seed Store
        console.log("Seeding Store...");
        await client.query(\`
            INSERT INTO "Store" (id, "userId", name, description, username, address, status, "isActive", "isVerified", logo, email, contact)
            VALUES ('store_demo', 'seller_demo', 'EcoVolt Batteries', 'Top quality recycled batteries in Lagos.', 'ecovolt', '123 Ikeja, Lagos', 'approved', true, true, '', 'adebayo@ecovolt.com', '08012345678')
            ON CONFLICT (id) DO NOTHING
        \`);

        // 3. Seed Product
        console.log("Seeding Product...");
        const now = new Date().toISOString();
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        
        await client.query(\`
            INSERT INTO "Product" (id, name, description, mrp, price, images, category, type, brand, amps, condition, "pickupAddress", "collectionDateStart", "collectionDateEnd", "collectionDates", quantity, "storeId", "inStock", "createdAt", "updatedAt")
            VALUES ('cmm8b9fol0001sw04gtxkjtw5', 'Scrap Inverter Batt (Dry cell) (100Ah) - Apapa', 'Verified scrap inverter battery. High lead content, ready for recycling.', 35000, 30000, ARRAY['/placeholder-battery.jpg'], 'Battery', 'INVERTER_DRY', 'EcoVolt', 100, 'SCRAP', 'Apapa, Lagos', '\${now}', '\${nextWeek}', ARRAY['\${now.split('T')[0]}'], 5, 'store_demo', true, '\${now}', '\${now}')
            ON CONFLICT (id) DO NOTHING
        \`);

        console.log("SQL Seed SUCCESSFUL!");

    } catch (err) {
        console.error("SQL Seed FAILED:", err.message);
        console.log(err);
    } finally {
        await client.end();
    }
}

seed();
