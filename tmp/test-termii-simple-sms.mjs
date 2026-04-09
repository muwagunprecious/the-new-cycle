import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
const SENDER_ID = "Campteller"; 
const BASE_URL = "https://api.ng.termii.com";

async function sendSimpleSMS() {
    const url = `${BASE_URL}/api/sms/send`;
    console.log(`Sending Simple SMS to ${PHONE} using Termii API (${url}) with sender "Campteller"...`);
    
    const payload = {
        api_key: API_KEY,
        to: PHONE,
        from: SENDER_ID,
        sms: "Hello! If you receive this, it means your DND is deactivated. Verification code: 99824.",
        type: "plain",
        channel: "generic"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.message_id || data.status === "success" || data.message === "Successfully Sent") {
            console.log("SUCCESS: SMS sent!");
        } else {
            console.error("FAILED: SMS not sent.");
        }
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

sendSimpleSMS();
