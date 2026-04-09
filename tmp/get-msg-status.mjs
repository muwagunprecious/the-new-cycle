import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL || "https://api.ng.termii.com";
const MESSAGE_ID = "3017753445631996135032118";

async function getStatus() {
    console.log("Checking Message Status...");
    try {
        const url = `${BASE_URL}/api/sms/inbox?api_key=${API_KEY}&message_id=${MESSAGE_ID}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log("INBOX DATA:", JSON.stringify(data, null, 2));
        
        if (data.data && data.data.length > 0) {
            const msg = data.data[0];
            console.log(`Status for ${MESSAGE_ID}:`, msg.status);
            console.log(`To: ${msg.to}`);
            console.log(`Sent At: ${msg.sent_at}`);
        } else {
            console.log("No data found for this Message ID in inbox.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

getStatus();
