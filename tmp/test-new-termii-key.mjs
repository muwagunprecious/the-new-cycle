import https from 'https';

async function testNewKey() {
    const API_KEY = "TLpQZiLvPuhaPimTDDEHOTAuDuomZRVJqunQhIlIlzEfszgsqhAEioGsAImBwD";
    const ENDPOINT = "https://api.ng.termii.com/api/sms/send";
    const TO = "2349023323399";
    const FROM = "Termii";
    const SMS = "Testing the new Termii Live API Key. If you see this, it works!";
    const TYPE = "plain";
    const CHANNEL = "generic";

    console.log(`--- Testing NEW Termii Live API Key ---`);
    console.log(`Target: ${TO}`);
    console.log(`Sender ID: ${FROM}`);
    console.log(`Channel: ${CHANNEL}`);

    const payload = JSON.stringify({
        api_key: API_KEY,
        to: TO,
        from: FROM,
        sms: SMS,
        type: TYPE,
        channel: CHANNEL
    });

    console.log("Request Payload:", payload);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = https.request(ENDPOINT, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log(`Response Status: ${res.statusCode}`);
            console.log(`Full Response Body: ${responseData}`);

            try {
                const data = JSON.parse(responseData);
                if (data.code === "ok" || res.statusCode === 200) {
                    console.log("\n✅ API Success!");
                    console.log(`Message ID: ${data.message_id || 'N/A'}`);
                    console.log(`Balance: ${data.balance || 'N/A'}`);
                    console.log(`User: ${data.user || 'N/A'}`);
                } else {
                    console.error("\n❌ API Failure!");
                }
            } catch (err) {
                console.error("Failed to parse JSON response:", err.message);
            }
        });
    });

    req.on('error', (err) => {
        console.error("❌ Request Error:", err.message);
    });

    req.write(payload);
    req.end();
}

testNewKey();
