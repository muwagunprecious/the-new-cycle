import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL || "https://api.ng.termii.com";
const PHONE_NUMBER = "2349023323399";
const SENDER_ID = process.env.TERMII_SENDER_ID || "Campteller";

async function debug() {
    console.log(`--- Advanced Termii Debug for ${PHONE_NUMBER} ---`);

    // 1. DND Status (Precise Check)
    try {
        console.log("\n1. Checking DND Status...");
        const dndUrl = `${BASE_URL}/api/check/dnd?api_key=${API_KEY}&phone_number=${PHONE_NUMBER}`;
        const dndRes = await fetch(dndUrl);
        const dndData = await dndRes.json();
        console.log("DND Response:", JSON.stringify(dndData, null, 2));
    } catch (e) {
        console.error("DND Check Error:", e.message);
    }

    // 2. Sender ID Route Verification
    try {
        console.log("\n2. Verifying Sender ID Route...");
        const senderUrl = `${BASE_URL}/api/sender-id?api_key=${API_KEY}`;
        const senderRes = await fetch(senderUrl);
        const senderData = await senderRes.json();
        const activeSender = senderData.content?.find(s => s.sender_id === SENDER_ID);
        console.log(`Sender ID [${SENDER_ID}] Status:`, activeSender ? activeSender.status : "NOT FOUND");
    } catch (e) {
        console.error("Sender ID Check Error:", e.message);
    }

    // 3. Test send via 'dnd' channel
    try {
        console.log("\n3. Testing Delivery via 'dnd' (Transactional) channel...");
        const sendUrl = `${BASE_URL}/api/sms/send`;
        const payload = {
            api_key: API_KEY,
            to: PHONE_NUMBER,
            from: SENDER_ID,
            sms: "DND Test: This is a transactional route test. Please confirm receipt.",
            type: "plain",
            channel: "dnd"
        };
        const sendRes = await fetch(sendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const sendData = await sendRes.json();
        console.log("DND Send Attempt Response:", JSON.stringify(sendData, null, 2));
    } catch (e) {
        console.error("DND Send Error:", e.message);
    }
}

debug();
