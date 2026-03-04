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
        await client.query('INSERT INTO users (id, name, email, password, image, role, "isEmailVerified", phone) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ' +
            'ON CONFLICT (id) DO UPDATE SET role = $6',
            ['admin_demo', 'Demo Admin', 'admin@gocycle.com', passwordHash, '', 'ADMIN', true, '08000000001']);

        // Seller
        await client.query('INSERT INTO users (id, name, email, password, image, role, "isEmailVerified", phone) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ' +
            'ON CONFLICT (id) DO UPDATE SET role = $6',
            ['seller_demo', 'Adebayo Ecovolt', 'adebayo@ecovolt.com', sellerHash, '', 'SELLER', true, '08000000002']);

        // Buyer
        await client.query('INSERT INTO users (id, name, email, password, image, role, "isEmailVerified", phone, "accountStatus") ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ' +
            'ON CONFLICT (id) DO UPDATE SET role = $6, "accountStatus" = $9',
            ['buyer_demo', 'Demo Buyer', 'buyer@gocycle.com', buyerHash, '', 'USER', true, '08000000003', 'approved']);

        // 2. Seed Store
        console.log("Seeding Store...");
        await client.query('INSERT INTO "Store" (id, "userId", name, description, username, address, status, "isActive", "isVerified", logo, email, contact) ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ' +
            'ON CONFLICT (id) DO NOTHING',
            ['store_demo', 'seller_demo', 'EcoVolt Batteries', 'Top quality recycled batteries in Lagos.', 'ecovolt', '123 Ikeja, Lagos', 'approved', true, true, '', 'adebayo@ecovolt.com', '08012345678']);

        // 3. Seed Product
        console.log("Seeding Product...");
        const now = new Date();
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await client.query('INSERT INTO "Product" (id, name, description, mrp, price, images, category, type, brand, amps, condition, "pickupAddress", "collectionDateStart", "collectionDateEnd", "collectionDates", quantity, "storeId", "inStock", "createdAt", "updatedAt") ' +
            'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) ' +
            'ON CONFLICT (id) DO NOTHING',
            ['cmm8b9fol0001sw04gtxkjtw5', 'Scrap Inverter Batt (Dry cell) (100Ah) - Apapa', 'Verified scrap inverter battery. High lead content, ready for recycling.', 35000, 30000, ['/placeholder-battery.jpg'], 'Battery', 'INVERTER_DRY', 'EcoVolt', 100, 'SCRAP', 'Apapa, Lagos', now, nextWeek, [now.toISOString().split('T')[0]], 5, 'store_demo', true, now, now]);

        console.log("SQL Seed SUCCESSFUL!");

    } catch (err) {
        console.error("SQL Seed FAILED:", err.message);
    } finally {
        await client.end();
    }
}

seed();
