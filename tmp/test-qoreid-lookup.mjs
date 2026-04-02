const CLIENT_ID = "BG2C18455E6X93WKFVX3";
const SECRET_KEY = "ee0362354ac0456aa83a36ced6dbbe21";
const BASE_URL = "https://api.qoreid.com";

async function getAccessToken() {
    console.log("Fetching access token...");
    const response = await fetch(`${BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: CLIENT_ID, secret: SECRET_KEY })
    });
    const data = await response.json();
    return data.accessToken;
}

async function testNINLookup(nin, firstname = "FETCH", lastname = "FETCH") {
    console.log(`\n--- Testing NIN Lookup for: ${nin} with names [${firstname}, ${lastname}] ---`);
    const token = await getAccessToken();
    
    // Testing both standard and premium endpoints
    const endpoints = [
        `/v1/ng/identities/nin/${nin}`,
        `/v1/ng/identities/nin-premium/${nin}`
    ];

    for (const endpoint of endpoints) {
        console.log(`\nCalling: ${endpoint}`);
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': CLIENT_ID,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstname, lastname })
            });

            const data = await response.json();
            console.log(`Response [${response.status}]:`, JSON.stringify(data, null, 2));

            // Check if we got any biodata back
            const bio = data.nin || data;
            if (bio.firstname && bio.firstname !== firstname) {
                console.log("🌟 SUCCESS! Fetched real name:", bio.firstname, bio.lastname);
            } else {
                console.log("❌ No different name returned.");
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    }
}

// Using the sample NIN from documentation
testNINLookup("63184876213");
