const API_KEY = "TLEQQDpBwpVunXVBzTfmYCMuOqCdfguLgNsVWZzxIAGyptZGZnVxTOTdzwaXys";
const TO = "2349023323399";

const HOSTS = ["https://api.ng.termii.com", "https://v3.api.termii.com", "https://api.termii.com"];
const PATHS = [
    "/api/sms/number/send",
    "/api/number/send",
    "/api/sms/number",
    "/api/number",
    "/api/sms/send/number",
    "/sms/number/send",
    "/sms/number"
];

async function discoverEndpoints() {
    for (const host of HOSTS) {
        for (const path of PATHS) {
            const url = host + path;
            console.log(`\n--- Discovery: ${url} ---`);
            
            const payload = {
                api_key: API_KEY,
                to: TO,
                sms: "Discovery test from GoCycle: " + path
            };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                console.log(`Response [${response.status}]:`, JSON.stringify(data));
                
                if (response.status !== 404 && response.status !== 405) {
                    console.log("🌟 POTENTIAL ENDPOINT FOUND! 🌟");
                }
            } catch (error) {
                // Ignore connection errors/timeouts
            }
        }
    }
}

discoverEndpoints();
