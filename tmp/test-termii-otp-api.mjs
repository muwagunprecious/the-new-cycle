import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
// Using the active Sender ID found in diagnostic: "Campteller"
const SENDER_ID = "Campteller"; 
const BASE_URL = "https://api.ng.termii.com";

async function testSendTokenNewKey() {
    const url = `${BASE_URL}/api/sms/otp/send`;
    console.log(`Sending Token to ${PHONE} using Termii API (${url}) with sender "Campteller"...`);
    
    const payload = {
        api_key: API_KEY,
        message_type: "NUMERIC", 
        pin_type: "NUMERIC", 
        to: PHONE,
        from: SENDER_ID,
        channel: "generic", // Switched from "dnd" to "generic" as it's the active channel in the dashboard
        pin_attempts: 3,
        pin_time_to_live: 10,
        pin_length: 6,
        pin_placeholder: "< 1234 >",
        message_text: "Your GoCycle verification code is < 1234 >. Valid for 10 minutes. Do not share."
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
            console.log("SUCCESS: Token sent!");
        } else {
            console.error("FAILED: Token not sent.");
        }
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

testSendTokenNewKey();
