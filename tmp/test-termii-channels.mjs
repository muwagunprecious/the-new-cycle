// Test Termii Channels and Sender IDs
import { sendSMS } from '../backend/lib/sms.js';

const testPhone = process.argv[2];
const API_KEY = process.env.TERMII_API_KEY;
const BASE_URL = process.env.TERMII_BASE_URL;

if (!testPhone) {
    console.error("Please provide a phone number.");
    process.exit(1);
}

const senderIds = ["GoCycle", "N-Alert", "talert", "Termii", "CHANNELS"];
const channels = ["generic", "dnd"];

async function runMatrix() {
    for (const channel of channels) {
        for (const senderId of senderIds) {
            console.log(`\nTesting: Sender[${senderId}] Channel[${channel}]`);
            try {
                const payload = {
                    api_key: API_KEY,
                    to: testPhone,
                    from: senderId,
                    sms: `GoCycle Test: [${senderId}] [${channel}]`,
                    type: "plain",
                    channel: channel
                };

                const response = await fetch(`${BASE_URL}/api/sms/send`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();
                console.log(`Response [${response.status}]:`, JSON.stringify(data));

                if (response.ok && data.code === "ok") {
                    console.log(`✅ FOUND SUCCESS: Sender[${senderId}] Channel[${channel}]`);
                    return;
                }
            } catch (error) {
                console.error(`Error:`, error.message);
            }
        }
    }
}

runMatrix().catch(err => console.error(err));
