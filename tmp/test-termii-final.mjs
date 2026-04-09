import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
const BASE_URL = "https://v3.api.termii.com";

async function finalTest() {
    console.log(`--- Starting Final Test for ${PHONE} ---`);
    const formattedTo = PHONE;
    const senderId = "Campteller";

    // 1. Test SMS OTP
    try {
        console.log(`\nStep 1: Sending SMS OTP (Generic Channel)...`);
        const res = await fetch(`${BASE_URL}/api/sms/otp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: API_KEY,
                message_type: "NUMERIC",
                to: formattedTo,
                from: senderId,
                channel: "generic", 
                pin_attempts: 3,
                pin_time_to_live: 10,
                pin_length: 6,
                pin_placeholder: "< 1234 >",
                message_text: "Final Test: Your GoCycle code is < 1234 >. Valid for 10 minutes.",
                pin_type: "NUMERIC"
            })
        });
        const data = await res.json();
        console.log("SMS OTP Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("SMS OTP Error:", e.message);
    }

    // 2. Test Voice OTP (The reliable fallback)
    try {
        console.log(`\nStep 2: Sending Voice OTP (The Reliable Fallback)...`);
        const res = await fetch(`${BASE_URL}/api/sms/otp/call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: API_KEY,
                phone_number: formattedTo,
                code: 3344
            })
        });
        const data = await res.json();
        console.log("Voice OTP Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Voice OTP Error:", e.message);
    }
}

finalTest();
