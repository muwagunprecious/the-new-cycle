import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLEQQDpBwpVunXVBzTfmYCMuOqCdfguLgNsVWZzxIAGyptZGZnVxTOTdzwaXys";
const PHONE = "2349023323399";
// Trying v3 for Number API
const BASE_URL = "https://v3.api.termii.com"; 

async function testNumberAPIV3() {
    const url = `${BASE_URL}/api/sms/number/send`;
    console.log(`Sending SMS to ${PHONE} using Termii Number API V3 (${url})...`);
    
    const payload = {
        api_key: API_KEY,
        to: PHONE,
        sms: "Hello! Your GoCycle verification code is 123456. Test V3."
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.code === "ok") {
            console.log("SUCCESS: Number API message sent!");
        } else {
            console.error("FAILED: Number API message not sent.");
        }
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

testNumberAPIV3();
