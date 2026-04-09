import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL || "https://api.ng.termii.com";
const MESSAGE_ID = "3017753445631996135032118";
const PHONE_NUMBER = "2349023323399";

async function debugSms() {
    console.log(`--- Debugging Termii SMS [ID: ${MESSAGE_ID}] ---`);

    // 1. Check Message Status
    try {
        const url = `${BASE_URL}/api/sms/inbox?api_key=${API_KEY}&message_id=${MESSAGE_ID}`;
        console.log(`Checking Status: ${url.replace(API_KEY, 'HIDDEN')}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log("Message Status Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error checking status:", error.message);
    }

    // 2. Check DND Status
    try {
        const url = `${BASE_URL}/api/check/dnd?api_key=${API_KEY}&phone_number=${PHONE_NUMBER}`;
        console.log(`Checking DND: ${url.replace(API_KEY, 'HIDDEN')}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log("DND Check Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error checking DND:", error.message);
    }

    // 3. Check Sender IDs
    try {
        const url = `${BASE_URL}/api/sender-id?api_key=${API_KEY}`;
        console.log(`Checking Sender IDs: ${url.replace(API_KEY, 'HIDDEN')}`);
        const response = await fetch(url);
        const data = await response.json();
        console.log("Sender ID List:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error checking Sender IDs:", error.message);
    }
}

debugSms();
