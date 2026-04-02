const API_KEY = "TLEQQDpBwpVunXVBzTfmYCMuOqCdfguLgNsVWZzxIAGyptZGZnVxTOTdzwaXys";
const TO = "2349023323399";
const URL = "https://api.ng.termii.com/api/sms/send/number";

async function testNumberAlt() {
    console.log(`Testing: ${URL}`);
    const payload = {
        api_key: API_KEY,
        to: TO,
        sms: "Test from GoCycle: Alternative Number API path"
    };

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log(`Response [${response.status}]:`, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

testNumberAlt();
