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
    console.log('Testing OAuth2 patterns...');

    const basicAuth = Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString('base64');

    // Pattern 1: POST JSON to various paths
    const paths = ['/token', '/oauth/token', '/v1/auth/token', '/auth/token'];
    for (const p of paths) {
        await runTest(`JSON POST ${p}`, `${BASE_URL}${p}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY })
        });
    }

    // Pattern 2: Basic Auth to various paths
    for (const p of paths) {
        await runTest(`Basic Auth ${p}`, `${BASE_URL}${p}`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
    }

    fs.writeFileSync('tmp/qoreid-oauth-results.json', JSON.stringify(results, null, 2));
    console.log('Results in tmp/qoreid-oauth-results.json');
}

start();
