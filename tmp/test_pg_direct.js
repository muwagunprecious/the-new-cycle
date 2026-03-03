const { Client } = require('pg');

async function main() {
    const directUrl = "postgresql://postgres.owrvuvowerbkgswkorio:FVa5jOVCCenTzBn3@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable";
    const client = new Client({ connectionString: directUrl });
    try {
        await client.connect();
        const stores = await client.query('SELECT id, name, status, "isActive", "isVerified" FROM "Store"');
        const products = await client.query('SELECT id, name, "inStock", "storeId" FROM "Product"');
        console.log(JSON.stringify({ stores: stores.rows, products: products.rows }, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
main();
