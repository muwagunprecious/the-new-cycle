const API_KEY = "TLEQQDpBwpVunXVBzTfmYCMuOqCdfguLgNsVWZzxIAGyptZGZnVxTOTdzwaXys";
const TO = "2349023323399";

const VARIATIONS = [
    "https://api.ng.termii.com/api/sms/number/send",
    "https://api.ng.termii.com/sms/number/send",
    "https://v3.api.termii.com/api/sms/number/send",
    "https://v3.api.termii.com/sms/number/send",
    "https://api.ng.termii.com/api/sms/otp/send", // Also test OTP variations
    "https://api.ng.termii.com/sms/otp/send"
];

async function testVariations() {
    for (const url of VARIATIONS) {
        console.log(`\n--- Testing: ${url} ---`);
        const payload = {
            api_key: API_KEY,
            to: TO,
            sms: "Test from GoCycle: " + url,
            message_type: "NUMERIC", // For OTP
            to: TO, // Redundant but safe
            from: "N-Alert", // For OTP
            channel: "generic",
            pin_attempts: 10,
            pin_time_to_live: 10,
            pin_length: 6,
            pin_placeholder: "< 123456 >",
            message_text: "Code: 123456",
            pin_type: "NUMERIC"
        };
        
        // Clean payload for Number API
        if (url.includes("number")) {
            delete payload.message_type;
            delete payload.from;
            delete payload.channel;
            delete payload.pin_attempts;
            delete payload.pin_time_to_live;
            delete payload.pin_length;
            delete payload.pin_placeholder;
            delete payload.message_text;
            delete payload.pin_type;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(`Response [${response.status}]:`, JSON.stringify(data));
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

testVariations();
