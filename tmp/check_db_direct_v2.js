const { Client } = require('pg');

async function main() {
    const client = new Client({
        connectionString: "postgresql://postgres.owrvuvowerbkgswkorio:FVa5jOVCCenTzBn3@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable"
    });
    await client.connect();

    const stores = await client.query('SELECT * FROM "Store"');
    console.log("STORES COUNT:", stores.rowCount);
    stores.rows.forEach(s => console.log(`STORE: ${s.name} | STATUS: ${s.status} | ACTIVE: ${s.isActive}`));

    const products = await client.query('SELECT * FROM "Product"');
    console.log("PRODUCTS COUNT:", products.rowCount);
    products.rows.forEach(p => console.log(`PRODUCT: ${p.name} | IN_STOCK: ${p.inStock} | STORE_ID: ${p.storeId}`));

    await client.end();
}

main().catch(console.error);
