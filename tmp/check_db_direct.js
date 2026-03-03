const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: "postgresql://postgres.owrvuvowerbkgswkorio:FVa5jOVCCenTzBn3@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable"
    });
    await client.connect();

    const res = await client.query('SELECT id, name, status, "isActive", "isVerified" FROM "Store"');
    console.log("Stores in DB:", res.rows);

    const prodRes = await client.query('SELECT id, name, "storeId", "inStock" FROM "Product"');
    console.log("Products in DB:", prodRes.rows);

    await client.end();
}

main().catch(console.error);
