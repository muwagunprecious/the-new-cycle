import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
// Testing with "Campteller" as the WhatsApp sender ID/device name
const SENDER_ID = "Campteller"; 
const BASE_URL = "https://api.ng.termii.com";

async function testWhatsAppOTP() {
    // Standard SMS endpoint but with whatsapp_otp channel
    const url = `${BASE_URL}/api/sms/send`;
    console.log(`Sending WhatsApp OTP to ${PHONE} using Termii API (${url}) with sender "Campteller"...`);
    
    const payload = {
        api_key: API_KEY,
        to: PHONE,
        from: SENDER_ID,
        sms: "Hello! Your GoCycle verification code is 123456.",
        type: "plain",
        channel: "whatsapp_otp"
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
            console.log("SUCCESS: WhatsApp message sent!");
        } else {
            console.error("FAILED: WhatsApp message not sent.");
        }
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

testWhatsAppOTP();
