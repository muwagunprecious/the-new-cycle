import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLEQQDpBwpVunXVBzTfmYCMuOqCdfguLgNsVWZzxIAGyptZGZnVxTOTdzwaXys";
const PHONE = "2349023323399";
const SENDER_ID = "talert"; 
const BASE_URL = "https://api.ng.termii.com";

async function testPlainSMS() {
    const url = `${BASE_URL}/api/sms/send`;
    console.log(`Sending Plain SMS to ${PHONE} using Termii API (${url}) with sender talert...`);
    
    const payload = {
        api_key: API_KEY,
        to: PHONE,
        from: SENDER_ID,
        sms: "Hello! This is a test message from GoCycle. Verified.",
        type: "plain",
        channel: "dnd"
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
            console.log("SUCCESS: Plain SMS sent!");
        } else {
            console.error("FAILED: Plain SMS not sent.");
        }
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

testPlainSMS();
