const API_KEY = "TLEQQDpBwpVunXVBzTfmYCMuOqCdfguLgNsVWZzxIAGyptZGZnVxTOTdzwaXys";
const TO = "2349023323399";
const BASE_URL = "https://v3.api.termii.com";

async function testNumberAPI() {
    console.log("Testing Termii Number API with simplified payload...");
    
    const url = `${BASE_URL}/api/sms/number/send`;
    const payload = {
        api_key: API_KEY,
        to: TO,
        sms: "Verification code: 123456. Test from GoCycle Number API."
    };

    try {
        console.log(`POST to: ${url}`);
        console.log(`Payload: ${JSON.stringify(payload, null, 2)}`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(`Response [${response.status}]:`, JSON.stringify(data, null, 2));

        if (response.ok && (data.code === "ok" || data.message === "Successfully Sent")) {
            console.log("✅ Number API Success!");
        } else {
            console.error("❌ Number API Failed.");
        }
    } catch (error) {
        console.error(`Connection Error: ${error.message}`);
    }
}

testNumberAPI();
