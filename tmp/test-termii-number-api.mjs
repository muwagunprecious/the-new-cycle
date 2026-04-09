import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLEQQDpBwpVunXVBzTfmYCMuOqCdfguLgNsVWZzxIAGyptZGZnVxTOTdzwaXys";
const PHONE = "2349023323399";
const BASE_URL = "https://api.ng.termii.com";

async function testNumberAPI() {
    // Number API endpoint (auto-generated numbers, no Sender ID needed)
    const url = `${BASE_URL}/api/sms/number/send`;
    console.log(`Sending Token to ${PHONE} using Termii Number API (${url})...`);
    
    const payload = {
        api_key: API_KEY,
        to: PHONE,
        sms: "Hello! Your GoCycle verification code is 123456. Test."
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

testNumberAPI();
