const { Client } = require('pg')

const connectionString = process.env.DIRECT_URL;

async function main() {
    console.log("Connecting to database for manual migration...")
    const client = new Client({ connectionString })

    try {
        await client.connect()
        console.log("Connected! Running migration...")

        await client.query('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "collectionDates" TEXT[];')

        console.log("Migration successful: Added 'collectionDates' column.")
    } catch (err) {
        console.error("Migration failed:", err)
    } finally {
        await client.end()
    }
}

main()
