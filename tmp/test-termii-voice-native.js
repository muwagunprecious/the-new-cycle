const https = require('https');
require('dotenv').config();

const API_KEY = process.env.TERMII_API_KEY || "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const PHONE = "2349023323399";
const HOST = "api.ng.termii.com";

const payload = JSON.stringify({
    api_key: API_KEY,
    phone_number: PHONE,
    code: 5567
});

const options = {
    hostname: HOST,
    path: '/api/sms/otp/call',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    },
    timeout: 30000
};

console.log(`Triggering Voice OTP to ${PHONE} via https://${HOST}${options.path}...`);

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
            if (res.statusCode === 200 && (parsed.code === "ok" || parsed.status === "success")) {
                console.log("SUCCESS: Voice OTP call triggered!");
            } else {
                console.error("FAILED: Voice OTP not sent.");
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
