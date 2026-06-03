const { Client } = require('pg');

async function testConnection(url) {
  const client = new Client({ 
    connectionString: url,
    ssl: { rejectUnauthorized: false }
  });
  try {
    await client.connect();
    const res = await client.query('SELECT 1');
    console.log('SUCCESS connecting to:', url);
    await client.end();
  } catch (err) {
    console.error('ERROR connecting to:', url);
    console.error(err.message);
  }
}

async function main() {
  const base = "postgresql://postgres.qamfxfzxicraepxdncqd:IglooEstate2026%21@aws-0-eu-west-1.pooler.supabase.com";
  
  console.log("Testing 5432...");
  await testConnection(`${base}:5432/postgres`);

  console.log("Testing 5432 with pool_mode=transaction...");
  await testConnection(`${base}:5432/postgres?pool_mode=transaction`);

  console.log("Testing 6543...");
  await testConnection(`${base}:6543/postgres`);
}

main();
