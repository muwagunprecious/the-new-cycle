const { Client } = require('pg');

const configs = [
    { pid: 'mrswfnmpmhbufhorutew', host: 'aws-1-eu-north-1.pooler.supabase.com', pw: 'yEIyAjyYOEJZ8bmb' },
    { pid: 'mrswfnmpmhbufhorutew', host: 'db.mrswfnmpmhbufhorutew.supabase.co', pw: 'yEIyAjyYOEJZ8bmb' },
    { pid: 'fbsmnlinkndqiiicpuet', host: 'aws-1-eu-west-1.pooler.supabase.com', pw: '66bL8Z0vCK31RR7W' },
    { pid: 'fbsmnlinkndqiiicpuet', host: 'db.fbsmnlinkndqiiicpuet.supabase.co', pw: '66bL8Z0vCK31RR7W' },
    { pid: 'fbsmnlinkndqiiicpuet', host: 'aws-1-eu-west-1.pooler.supabase.com', pw: 'GocycleAfrica123@' },
    { pid: 'fbsmnlinkndqiiicpuet', host: 'db.fbsmnlinkndqiiicpuet.supabase.co', pw: 'GocycleAfrica123@' }
];

const ports = [5432, 6543];

async function test() {
    for (const c of configs) {
        for (const port of ports) {
            const users = ['postgres', 'postgres.' + c.pid];
            for (const user of users) {
                const url = `postgresql://${user}:${encodeURIComponent(c.pw)}@${c.host}:${port}/postgres${port === 6543 ? '?pgbouncer=true' : ''}`;
                const client = new Client({
                    connectionString: url,
                    ssl: { rejectUnauthorized: false }
                });

                try {
                    console.log(`Testing ${user} on ${c.host}:${port}...`);
                    await client.connect();
                    console.log('SUCCESS_CONNECTION_STRING=' + url);
                    await client.end();
                    process.exit(0);
                } catch (e) {
                    console.log(`FAIL: ${e.message}`);
                }
            }
        }
    }
    console.log('FINAL_FAIL_ALL_COMBINATIONS');
}

test();
