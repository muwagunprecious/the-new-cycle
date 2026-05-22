const { Client } = require('pg')

const connectionString = 'postgresql://postgres.qamfxfzxicraepxdncqd:IglooEstate2026!@aws-0-eu-west-1.pooler.supabase.com:6543/postgres'

async function main() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('Connecting to database...')
    await client.connect()
    console.log('Connected!')

    console.log('Creating contact_messages table...')
    await client.query(`
      CREATE TABLE IF NOT EXISTS "contact_messages" (
        "id"           TEXT NOT NULL,
        "firstName"    TEXT NOT NULL,
        "lastName"     TEXT NOT NULL,
        "email"        TEXT NOT NULL,
        "organization" TEXT,
        "phone"        TEXT NOT NULL,
        "message"      TEXT NOT NULL,
        "status"       TEXT NOT NULL DEFAULT 'unread',
        "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
      );
    `)

    console.log('✅ Table created successfully!')

  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    await client.end()
    console.log('Connection closed.')
  }
}

main()
