const API_KEY = "TLEQQDpBwpVunXVBzTfmYCMuOqCdfguLgNsVWZzxIAGyptZGZnVxTOTdzwaXys";
const TO = "2349023323399";
const BASE_URL = "https://api.ng.termii.com";

async function testWorkingOTP() {
    console.log("Testing Termii Token API with REFINED payload...");
    
    const url = `${BASE_URL}/api/sms/otp/send`;
    const payload = {
        api_key: API_KEY,
        to: TO,
        from: "GOCYCLE ", // Use the one found in sender-id (with space)
        channel: "generic",
        message_type: "NUMERIC",
        pin_attempts: 10,
        pin_time_to_live: 5,
        pin_length: 6,
        pin_placeholder: "< 123456 >",
        message_text: "Your GoCycle code is < 123456 >",
        pin_type: "NUMERIC"
    };

    try {
        console.log(`POST to: ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(`Response [${response.status}]:`, JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log("✅ SUCCESS!");
        } else {
            console.log("❌ FAILED. Retrying with 'N-Alert'...");
            payload.from = "N-Alert";
            const response2 = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data2 = await response2.json();
            console.log(`N-Alert Response [${response2.status}]:`, JSON.stringify(data2, null, 2));
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

testWorkingOTP();
