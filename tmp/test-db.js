const { Client } = require('pg');

const connectionString = "postgresql://postgres.owrvuvowerbkgswkorio:FVa5jOVCCenTzBn3@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=disable";

const client = new Client({
    connectionString: connectionString,
    ssl: false
});

client.connect()
    .then(() => {
        console.log('Successfully connected to the database!');
        return client.query('SELECT now()');
    })
    .then(res => {
        console.log('Current Time:', res.rows[0]);
        return client.end();
    })
    .catch(err => {
        console.error('Connection error:', err.stack);
        process.exit(1);
    });
