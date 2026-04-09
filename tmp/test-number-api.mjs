import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL || "https://api.ng.termii.com";
const PHONE_NUMBER = "2349023323399";

async function testNumberApi() {
    console.log(`--- Testing Termii Number API for ${PHONE_NUMBER} ---`);
    console.log("This route uses auto-generated numbers and is often a reliable fallback.");

    try {
        const url = `${BASE_URL}/api/sms/number/send`;
        const payload = {
            api_key: API_KEY,
            to: PHONE_NUMBER,
            sms: "Number API Test: This is a fallback route test using an auto-generated number. Please confirm receipt."
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Number API Response:", JSON.stringify(data, null, 2));

        if (data.code === "ok") {
            console.log("✅ Number API request accepted.");
        } else {
            console.error("❌ Number API request failed.");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testNumberApi();
