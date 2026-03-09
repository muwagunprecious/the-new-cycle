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
    console.log('Testing Alternative NIN Lookup Endpoints...');
    const token = await getAccessToken();

    // 1. Test nin-lookup
    await runTest('NIN Lookup v1', `${BASE_URL}/v1/ng/identities/nin-lookup/${TEST_NIN}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    // 2. Test root level nin-lookup (some are outside /ng/)
    await runTest('NIN Lookup Root', `${BASE_URL}/v1/identities/nin-lookup/${TEST_NIN}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    // 3. Test identities/nin with empty body to see if it works without match
    await runTest('NIN v1 (No Body)', `${BASE_URL}/v1/ng/identities/nin/${TEST_NIN}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    });

    fs.writeFileSync('tmp/qoreid-lookup-alt-results.json', JSON.stringify(results, null, 2));
    console.log('Results in tmp/qoreid-lookup-alt-results.json');
}

start();
