
const { Client } = require('pg');

const passwords = [
    'WjuULVcLBKYgFCot',
    'GocycleAfrica123@',
    'GocycleAfrica123',
    '66bL8Z0vCK31RR7W',
    'IglooEstate2026!',
    'yEIyAjyYOEJZ8bmb'
];

const project = 'tsjphcyurlfxmxtvkucc';
const host = 'aws-1-eu-west-1.pooler.supabase.com';

async function main() {
    for (const pw of passwords) {
        const url = `postgresql://postgres.${project}:${encodeURIComponent(pw)}@${host}:6543/postgres?pgbouncer=true&sslmode=require`;
        console.log(`Testing password: ${pw.substring(0, 3)}...`);

        const client = new Client({
            connectionString: url,
            ssl: { rejectUnauthorized: false }
        });

        try {
            await client.connect();
            console.log('SUCCESS! Password is:', pw);
            await client.end();
            process.exit(0);
        } catch (error) {
            console.log('Fail:', error.message);
        }
    }
    console.log('All passwords failed for tsjphcyurlfxmxtvkucc');
}

main();
