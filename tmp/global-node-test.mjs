import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
const GLOBAL_BASE_URL = "https://v3.api.termii.com";

async function globalNodeTest() {
    console.log(`--- Testing Global Node (v3.api.termii.com) for ${PHONE} ---`);
    
    // 1. Check Balance and Account ID
    try {
        console.log(`\nStep 1: Checking Account Balance...`);
        const url = `${GLOBAL_BASE_URL}/api/get-balance?api_key=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Balance Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Balance Check Error:", e.message);
    }

    // 2. Test Send with talert (Default Sender)
    try {
        console.log(`\nStep 2: Sending with "talert" (Default ID) on Generic...`);
        const url = `${GLOBAL_BASE_URL}/api/sms/send`;
        const payload = {
            api_key: API_KEY,
            to: PHONE,
            from: "talert",
            sms: "Deep Check: Your GoCycle code is 112233.",
            type: "plain",
            channel: "generic"
        };
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log("Send Status (talert):", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("talert Send Error:", e.message);
    }
}

globalNodeTest();
