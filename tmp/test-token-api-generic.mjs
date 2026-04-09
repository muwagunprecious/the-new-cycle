import https from 'https';

async function testTokenApiGeneric() {
    const API_KEY = "TLpQZiLvPuhaPimTDDEHOTAuDuomZRVJqunQhIlIlzEfszgsqhAEioGsAImBwD";
    const ENDPOINT = "https://api.ng.termii.com/api/sms/otp/send";
    const TO = "2349023323399";
    const FROM = "Campteller"; 

    console.log(`--- Testing Token API OTP (Generic Channel) for NEW Termii Live API Key ---`);
    console.log(`Target: ${TO}`);
    console.log(`Sender ID: ${FROM}`);

    const payload = JSON.stringify({
        api_key: API_KEY,
        message_type: "NUMERIC",
        to: TO,
        from: FROM,
        channel: "generic", 
        pin_attempts: 3,
        pin_time_to_live: 10,
        pin_length: 6,
        pin_placeholder: "< 1234 >",
        message_text: "Your GoCycle verification code is < 1234 >. Valid for 10 minutes. Do not share.",
        pin_type: "NUMERIC"
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
                if (data.pinId || data.pin_id) {
                    console.log("\n✅ API Success via Token API Generic!");
                    console.log(`Pin ID: ${data.pinId || data.pin_id}`);
                } else {
                    console.error("\n❌ API Failure via Token API Generic!");
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

testTokenApiGeneric();
