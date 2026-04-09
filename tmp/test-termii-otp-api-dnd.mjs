import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
const SENDER_ID = "Campteller"; 
const BASE_URL = "https://api.ng.termii.com";

async function testSendTokenDND() {
    const url = `${BASE_URL}/api/sms/otp/send`;
    console.log(`Sending Token to ${PHONE} using Termii API (${url}) with sender "Campteller" on DND channel...`);
    
    const payload = {
        api_key: API_KEY,
        message_type: "NUMERIC", 
        pin_type: "NUMERIC", 
        to: PHONE,
        from: SENDER_ID,
        channel: "dnd", // Trying DND to bypass potential blocks
        pin_attempts: 3,
        pin_time_to_live: 10,
        pin_length: 6,
        pin_placeholder: "< 1234 >",
        message_text: "Your GoCycle verification code is < 1234 >. Valid for 10 minutes."
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.pinId || data.pin_id) {
            console.log("SUCCESS: Token sent via DND channel!");
        } else {
            console.error("FAILED: Token not sent.");
        }
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

testSendTokenDND();
