
import fs from 'fs';
import path from 'path';

// Manual .env loader
function loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.join('=').trim().replace(/"/g, '');
        }
    });
}

loadEnv();

const CLIENT_ID = process.env.QOREID_CLIENT_ID;
const SECRET_KEY = process.env.QOREID_SECRET_KEY;
const BASE_URL = process.env.QOREID_BASE_URL || 'https://api.qoreid.com';

async function getAccessToken() {
    console.log('Fetching QoreID Access Token...');
    const response = await fetch(`${BASE_URL}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            clientId: CLIENT_ID,
            secret: SECRET_KEY
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Token Request Failed: ${JSON.stringify(data)}`);
    }
    return data.accessToken;
}

async function testCAC(rcNumber) {
    try {
        const token = await getAccessToken();
        const endpoint = `${BASE_URL}/v1/ng/identities/cac-premium`;
        
        console.log(`Testing CAC Premium for: ${rcNumber}`);
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                regNumber: rcNumber
            })
        });

        const data = await response.json();
        console.log('HTTP Status:', response.status);
        console.log('Summary:', JSON.stringify(data.summary || {}, null, 2));
        
        if (data.cac) {
            console.log('--- Business Details ---');
            console.log('Company Name:', data.cac.companyName);
            console.log('RC Number:', data.cac.rcNumber);
            console.log('Status:', data.cac.status);
            console.log('Directors:', (data.cac.directors || []).map(d => `${d.firstname} ${d.lastname}`).join(', '));
        } else {
            console.log('Response Message:', data.message || 'No detailed data');
        }

        return data;
    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

const testRC = process.argv[2] || '1327154';
testCAC(testRC);
