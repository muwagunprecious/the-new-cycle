import fs from 'fs';
import path from 'path';

function getEnv(key) {
    const envPath = 'c:/Users/TINGO-AI-010/Documents/Go-cycle/.env';
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        const [k, v] = line.split('=');
        if (k?.trim() === key) return v?.trim().replace(/^["']|["']$/g, '');
    }
    return null;
}

const CLIENT_ID = getEnv('QOREID_CLIENT_ID');
const SECRET_KEY = getEnv('QOREID_SECRET_KEY');
const BASE_URL = 'https://api.qoreid.com';

async function diagnoseNINStructure() {
    const nin = "63184876213"; // Sample NIN
    
    console.log("Fetching Token...");
    const tokenRes = await fetch(`${BASE_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY }),
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.accessToken;

    console.log(`Calling QoreID for NIN: ${nin}`);
    const endpoint = `${BASE_URL}/v1/ng/identities/nin/${nin}`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            firstname: "FETCH",
            lastname: "FETCH"
        }),
    });

    const data = await response.json();
    console.log("FULL RESPONSE:", JSON.stringify(data, null, 2));
}

diagnoseNINStructure();
