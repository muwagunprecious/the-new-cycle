import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL || "https://api.ng.termii.com";
const SENDER_ID = process.env.TERMII_SENDER_ID || "Campteller";

async function sendSms() {
    const to = "2349023323399";
    const message = "Hello! This is a test SMS from your Go-cycle application via Termii.";

    console.log(`Sending SMS to ${to} using Sender ID: ${SENDER_ID}...`);
    console.log(`Base URL: ${BASE_URL}`);

    if (!API_KEY) {
        console.error("❌ TERMII_API_KEY is missing from .env!");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/sms/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                api_key: API_KEY,
                to: to,
                from: SENDER_ID,
                sms: message,
                type: "plain",
                channel: "generic"
            })
        });

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));

        if (data.code === "ok" || response.ok) {
            console.log("✅ SMS sent successfully!");
        } else {
            console.error("❌ Failed to send SMS:", data.message || data);
        }
    } catch (error) {
        console.error("❌ Error connecting to Termii:", error.message);
    }
}

sendSms();
