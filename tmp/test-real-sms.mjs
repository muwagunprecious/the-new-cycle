// Test Real Termii SMS Utility
// import 'dotenv/config'; // Removed as we will use node --env-file=.env
import { sendSMS, sendOTP } from '../backend/lib/sms.js';

const testPhone = process.argv[2];

if (!testPhone) {
    console.error("Please provide a phone number: node tmp/test-real-sms.mjs 234XXXXXXXXXX");
    process.exit(1);
}

async function runTest() {
    console.log(`\n--- Testing Termii SMS Gateway ---`);
    console.log(`Target: ${testPhone}`);
    
    // Test 1: Generic SMS with Fallback
    console.log(`\nTest 1: Sending Generic SMS (Testing Fallback)...`);
    const result1 = await sendSMS(testPhone, "GoCycle: This is a functional test of our new SMS gateway fallback system.");
    
    if (result1.success) {
        console.log(`✅ Test 1 Passed! Used Sender ID: ${result1.usedSenderId}`);
    } else {
        console.error(`❌ Test 1 Failed: ${result1.error}`);
    }

    // Test 2: OTP specialized message
    console.log(`\nTest 2: Sending OTP Message...`);
    const result2 = await sendOTP(testPhone, "998877");
    
    if (result2.success) {
        console.log(`✅ Test 2 Passed!`);
    } else {
        console.error(`❌ Test 2 Failed: ${result2.error}`);
    }
}

runTest().catch(err => console.error("Fatal Error:", err));
