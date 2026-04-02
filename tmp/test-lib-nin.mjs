import { verifyNIN } from '../backend/lib/qoreid.js';
import dotenv from 'dotenv';
dotenv.config();

async function testLibNIN() {
    const nin = "63184876213"; // Sample NIN
    console.log(`Testing verifyNIN with NIN: ${nin}`);

    try {
        const result = await verifyNIN(nin);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Library Error:", error.message);
    }
}

testLibNIN();
