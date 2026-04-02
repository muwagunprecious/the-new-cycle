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

async function testV2() {
    const nin = "63184876213"; // Sample NIN
    
    console.log("Fetching Token...");
    const tokenRes = await fetch(`${BASE_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY }),
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.accessToken;

    if (!token) {
        console.error("Failed to get token:", tokenData);
        return;
    }

    const endpoints = [
        { name: "v1/ng/identities/nin (Standard - SANDBOX NIN)", url: `${BASE_URL}/v1/ng/identities/nin/63184876213` },
        { name: "v1/ng/identities/nin (Standard - USER NIN)", url: `${BASE_URL}/v1/ng/identities/nin/${nin}` },
    ];

    for (const ep of endpoints) {
        console.log(`\n--- Testing: ${ep.name} ---`);
        try {
            const body = {
                firstname: "FETCH",
                lastname: "FETCH"
            };
            if (ep.name.includes("Body ID")) {
                body.idNumber = nin;
            }
            const res = await fetch(ep.url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            console.log(`Status: ${res.status}`);
            console.log(`Response:`, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error(`Error for ${ep.name}:`, e.message);
        }
    }
}

testV2();
