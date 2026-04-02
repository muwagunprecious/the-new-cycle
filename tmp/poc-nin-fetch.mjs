import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.QOREID_CLIENT_ID;
const SECRET_KEY = process.env.QOREID_SECRET_KEY;
const BASE_URL = 'https://api.qoreid.com';

async function testNINLookupPOC() {
    const nin = "63184876213"; // Sample NIN
    
    console.log("1. Fetching Token...");
    const tokenRes = await fetch(`${BASE_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY }),
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.accessToken;
    console.log("Token received.");

    console.log(`2. Fetching NIN data for: ${nin}`);
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
    console.log("Response Status:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));

    const bio = data.nin || data;
    if (bio.firstname && bio.lastname) {
        console.log("SUCCESS! Found Identity:", bio.firstname, bio.lastname);
    } else {
        console.log("FAILURE: Identity found but no bio data returned.");
    }
}

testNINLookupPOC();
