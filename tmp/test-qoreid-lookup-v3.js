const path = require('path');
const fs = require('fs');

function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let value = (match[2] || '').trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[match[1]] = value;
        }
    });
}

loadEnv();

const CLIENT_ID = process.env.QOREID_CLIENT_ID;
const SECRET_KEY = process.env.QOREID_SECRET_KEY;
const BASE_URL = 'https://api.qoreid.com';
const TEST_NIN = '63184876213';

async function getAccessToken() {
    const res = await fetch(`${BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY })
    });
    const data = await res.json();
    return data.accessToken;
}

const results = [];

async function runTest(name, url, options) {
    try {
        const res = await fetch(url, options);
        const text = await res.text();
        results.push({
            name,
            url,
            status: res.status,
            response: text.substring(0, 1000)
        });
    } catch (e) {
        results.push({ name, url, status: 'ERROR', error: e.message });
    }
}

async function start() {
    console.log('Testing Universal Lookup Patterns...');
    const token = await getAccessToken();

    // 1. Post to root /nin with idNumber in body
    await runTest('NIN Root JSON Body', `${BASE_URL}/v1/ng/identities/nin`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idNumber: TEST_NIN })
    });

    // 2. Post to root /nin with id in body
    await runTest('NIN Root JSON Body (id)', `${BASE_URL}/v1/ng/identities/nin`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: TEST_NIN })
    });

    // 3. Try nin-id-retrieval
    await runTest('NIN ID Retrieval', `${BASE_URL}/v1/ng/identities/nin-id-retrieval/${TEST_NIN}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    fs.writeFileSync('tmp/qoreid-lookup-v3-results.json', JSON.stringify(results, null, 2));
    console.log('Results in tmp/qoreid-lookup-v3-results.json');
}

start();
