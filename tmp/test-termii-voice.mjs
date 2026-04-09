import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
const BASE_URL = "https://api.ng.termii.com";

async function testVoiceOTP() {
    const url = `${BASE_URL}/api/sms/otp/call`;
    console.log(`Sending Voice OTP to ${PHONE} using Termii Voice API...`);
    
    const payload = {
        api_key: API_KEY,
        phone_number: PHONE,
        code: 1234  // Code to be read
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.code === "ok" || data.status === "success") {
            console.log("SUCCESS: Voice OTP triggered! You should receive a call.");
        } else {
            console.error("FAILED: Voice OTP not sent.");
        }
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

testVoiceOTP();
