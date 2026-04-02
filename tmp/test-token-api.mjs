// Test Termii Token API
import { sendOTP } from '../backend/lib/sms.js';

const testPhone = process.argv[2];
const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL;

if (!testPhone) {
    console.error("Please provide a phone number.");
    process.exit(1);
}

async function testTokenAPI() {
    console.log(`\n--- Testing Termii Token API ---`);
    const payload = {
        api_key: API_KEY,
        message_type: "NUMERIC",
        to: testPhone,
        from: "N-Alert",
        channel: "generic",
        pin_attempts: 10,
        pin_time_to_live: 5,
        pin_length: 6,
        pin_placeholder: "< 123456 >",
        message_text: "Your GoCycle code is < 123456 >",
        pin_type: "NUMERIC"
    };

    try {
        const response = await fetch(`${BASE_URL}/api/sms/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log(`Response [${response.status}]:`, JSON.stringify(data));

        if (response.ok && data.code === "ok") {
            console.log(`✅ Token API Success!`);
        } else {
            console.error(`❌ Token API Failed:`, data.message);
        }
    } catch (error) {
        console.error(`Error:`, error.message);
    }
}

testTokenAPI().catch(err => console.error(err));
