import { sendOTP, verifyOTP } from '../backend/lib/sms.js';
import dotenv from 'dotenv';
dotenv.config();

const PHONE = "2349023323399";

async function testFullFlow() {
    console.log(`Step 1: Sending OTP to ${PHONE}...`);
    const sendResult = await sendOTP(PHONE);
    
    if (!sendResult.success) {
        console.error("FAIL: Could not send OTP:", sendResult.error);
        return;
    }

    const pinId = sendResult.pinId;
    console.log(`SUCCESS: OTP sent! Pin ID: ${pinId}`);
    console.log(`\nStep 2: Testing verifyOTP with an INCORRECT code (expecting failure)...`);
    
    const verifyResultFail = await verifyOTP(pinId, "000000");
    console.log("Response for incorrect code:", JSON.stringify(verifyResultFail, null, 2));
    
    if (verifyResultFail.verified === false) {
        console.log("✅ Verification Logic Working (Correctly rejected wrong code)");
    } else {
        console.error("❌ Unexpected verification result");
    }

    console.log(`\n--- MANUAL VERIFICATION REQUIRED ---`);
    console.log(`To verify the SUCCESS flow, run this in your terminal:`);
    console.log(`node -e "import('./backend/lib/sms.js').then(m => m.verifyOTP('${pinId}', 'YOUR_RECEIVED_CODE')).then(console.log)"`);
}

testFullFlow();
