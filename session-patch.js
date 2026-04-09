const { Client } = require('pg'); 

const client = new Client({ 
    connectionString: 'postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?pool_mode=session', 
    ssl: { rejectUnauthorized: false }
}); 

async function run() { 
    console.log('Connecting via Session Pooler Mode...'); 
    await client.connect(); 
    console.log('Connected!'); 
    
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessName" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "businessType" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fullName" TEXT;'); 
    await client.query('ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verificationCode" TEXT;'); 
    
    console.log('✅ Success! The database is officially patched.'); 
    await client.end(); 
} 
run().catch(console.error);
