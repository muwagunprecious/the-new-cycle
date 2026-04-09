const https = require('https');
require('dotenv').config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
const SENDER_ID = "Campteller"; 
const BASE_URL = "api.ng.termii.com"; // Host only for https.request

const payload = JSON.stringify({
    api_key: API_KEY,
    to: PHONE,
    from: SENDER_ID,
    sms: "Your GoCycle verification code is 123456.",
    type: "plain",
    channel: "whatsapp_otp"
});

const options = {
    hostname: BASE_URL,
    path: '/api/sms/send',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    },
    timeout: 30000 // 30 seconds
};

console.log(`Sending WhatsApp OTP to ${PHONE} using ${options.path}...`);

const req = https.request(options, (res) => {
    let data = '';
    console.log('Status Code:', res.statusCode);
    
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Body:', data);
        try {
            const parsed = JSON.parse(data);
            if (res.statusCode === 200 && (parsed.message_id || parsed.status === "success" || parsed.message === "Successfully Sent")) {
                console.log("SUCCESS: WhatsApp message sent!");
            } else {
                console.error("FAILED: WhatsApp message not sent.");
            }
        } catch (e) {
            console.error("Error parsing response:", e.message);
        }
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e.message);
});

req.write(payload);
req.end();
