const { Client } = require('pg'); 

const client = new Client({ 
    connectionString: 'postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres', 
    ssl: { rejectUnauthorized: false }
}); 

async function run() { 
    console.log('Connecting to Db via Pooler...'); 
    await client.connect(); 
    console.log('Connected! Killing any locking queries...');
    // Kill queries locking the users table from previous aborted attempts
    await client.query(`
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE pid <> pg_backend_pid() 
        AND state = 'active';
    `).catch(() => {});
    
    console.log('Running Patches...'); 
    
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
