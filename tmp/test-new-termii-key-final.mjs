import https from 'https';

async function testNewKeyFinal() {
    const API_KEY = "TLpQZiLvPuhaPimTDDEHOTAuDuomZRVJqunQhIlIlzEfszgsqhAEioGsAImBwD";
    const ENDPOINT = "https://api.ng.termii.com/api/sms/send";
    const TO = "2349023323399";
    const FROM = "Campteller"; // Using the approved Sender ID found in previous step
    const SMS = "Final test! Using the approved 'Campteller' Sender ID with the new Live API Key.";
    const TYPE = "plain";
    const CHANNEL = "generic";

    console.log(`--- Final Test for NEW Termii Live API Key (Valid Sender ID) ---`);
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
                    console.error(data.message || data);
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

testNewKeyFinal();
