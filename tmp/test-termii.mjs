// Test Termii SMS script
require('dotenv').config();

const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL;
const SENDER_ID = process.env.TERMII_SENDER_ID || "GoCycle";

async function testSMS(phone) {
    console.log(`Starting Termii SMS test to: ${phone}`);
    console.log(`Base URL: ${BASE_URL}`);

    if (!API_KEY) {
        console.error("Error: TERMII_API_KEY is not set in .env");
        return;
    }

    const payload = {
        api_key: API_KEY,
        to: phone,
        from: SENDER_ID,
        sms: "GoCycle: Your verification code is 123456. This is a test.",
        type: "plain",
        channel: "generic"
    };

    try {
        const response = await fetch(`${BASE_URL}/api/sms/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("Response Data:", JSON.stringify(data, null, 2));

        if (response.ok && data.code === "ok") {
            console.log("✅ SMS sent successfully!");
        } else {
            console.error("❌ SMS failed to send.");
        }
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
    }
}

// Get phone from command line or use a dummy
const testPhone = process.argv[2];
if (!testPhone) {
    console.error("Please provide a phone number as an argument: node test-termii.mjs 234XXXXXXXXXX");
    process.exit(1);
}

testSMS(testPhone);
