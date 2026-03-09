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

async function start() {
    console.log('Testing GET NIN Fetch...');
    const token = await getAccessToken();

    const url = `${BASE_URL}/v1/ng/identities/nin/${TEST_NIN}`;
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response:', text.substring(0, 500));
        fs.writeFileSync('tmp/qoreid-get-results.json', text);
    } catch (e) {
        console.log('Error:', e.message);
    }
}

start();
