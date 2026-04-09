const { Client } = require('pg'); 

const client = new Client({ 
    connectionString: 'postgresql://postgres:WjuULVcLBKYgFCot@db.tsjphcyurlfxmxtvkucc.supabase.co:5432/postgres', 
    ssl: { rejectUnauthorized: false }
}); 

async function run() { 
    console.log('Connecting to true Db Host...'); 
    await client.connect(); 
    console.log('Connected!'); 
    
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessName" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fullName" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationCode" TEXT;'); 
    
    console.log('✅ Success! The crash bug is fully fixed natively.'); 
    await client.end(); 
} 
run().catch(console.error);
