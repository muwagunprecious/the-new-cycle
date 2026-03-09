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
const TEST_NIN = '12345678901';

const results = [];

async function runTest(name, url, options) {
    const startTime = Date.now();
    try {
        const res = await fetch(url, options);
        const text = await res.text();
        const duration = Date.now() - startTime;
        results.push({
            name,
            url,
            status: res.status,
            duration,
            response: text.substring(0, 500)
        });
    } catch (e) {
        results.push({
            name,
            url,
            status: 'ERROR',
            error: e.message
        });
    }
}

async function start() {
    // 1. Token Endpoints
    await runTest('Auth Token v1', `${BASE_URL}/v1/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY })
    });

    await runTest('Get Client Token v1', `${BASE_URL}/v1/get-client-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY })
    });

    await runTest('Auth v1', `${BASE_URL}/v1/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY })
    });

    // 2. Direct API calls with different headers
    await runTest('Direct Bearer (Secret)', `${BASE_URL}/v1/ng/identities/nin/${TEST_NIN}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstname: 'TEST', lastname: 'TEST' })
    });

    await runTest('Direct x-api-key (Secret)', `${BASE_URL}/v1/ng/identities/nin/${TEST_NIN}`, {
        method: 'POST',
        headers: {
            'x-api-key': SECRET_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstname: 'TEST', lastname: 'TEST' })
    });

    await runTest('Direct x-api-key + x-client-id', `${BASE_URL}/v1/ng/identities/nin/${TEST_NIN}`, {
        method: 'POST',
        headers: {
            'x-api-key': SECRET_KEY,
            'x-client-id': CLIENT_ID,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstname: 'TEST', lastname: 'TEST' })
    });

    fs.writeFileSync('tmp/qoreid-diag-results.json', JSON.stringify(results, null, 2));
    console.log('Diagnostic finished. Results in tmp/qoreid-diag-results.json');
}

start();
