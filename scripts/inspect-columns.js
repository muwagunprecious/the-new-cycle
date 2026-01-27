const { Client } = require('pg')
const connectionString = process.env.DATABASE_URL.replace('?connect_timeout=60', '')

async function main() {
    const client = new Client({ connectionString })
    try {
        await client.connect()
        const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Product';")
        console.log("Columns in 'Product' table:")
        console.table(res.rows)
    } catch (err) {
        console.error(err)
    } finally {
        await client.end()
    }
}

main()
