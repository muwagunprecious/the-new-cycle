const { Client } = require('pg')

const connectionString = "postgresql://postgres.tsjphcyurlfxmxtvkucc:WjuULVcLBKYgFCot@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable"

async function run() {
    const client = new Client({
        connectionString: connectionString,
        connectionTimeoutMillis: 10000,
    })

    try {
        console.log("Connecting to database directly...")
        await client.connect()
        console.log("Connected! Adding walletBalance field to users table...")

        // Check if column exists first to avoid error
        const checkRes = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='walletBalance';
        `)

        if (checkRes.rows.length === 0) {
            await client.query('ALTER TABLE "users" ADD COLUMN "walletBalance" DOUBLE PRECISION DEFAULT 0;')
            console.log("Success: walletBalance added to users table.")
        } else {
            console.log("Column walletBalance already exists.")
        }

    } catch (err) {
        console.error("Error executing SQL:", err.message)
    } finally {
        await client.end()
    }
}

run()
