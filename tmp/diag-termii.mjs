const API_KEY = "TLdMBwHsEWxlbAzZPtDWdOVFMODSEtPmSPNZMzOrxhJrudeOJQmPwxOJUkeNsi";
const BASE_URLS = ["https://api.ng.termii.com", "https://v3.api.termii.com"];

async function runDiagnostic() {
    console.log("Starting Termii Diagnostic...\n");

    for (const baseUrl of BASE_URLS) {
        console.log(`--- Testing Base URL: ${baseUrl} ---`);
        
        // 1. Fetch Sender IDs
        try {
            const url = `${baseUrl}/api/sender-id?api_key=${API_KEY}`;
            console.log(`Fetching Sender IDs from: ${url}`);
            const response = await fetch(url);
            const data = await response.json();
            console.log(`Response [${response.status}]:`, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error fetching sender IDs: ${error.message}`);
        }

        // 2. Check Balance (Good way to verify API Key)
        try {
            const url = `${baseUrl}/api/get-balance?api_key=${API_KEY}`;
            console.log(`\nChecking Balance from: ${url}`);
            const response = await fetch(url);
            const data = await response.json();
            console.log(`Response [${response.status}]:`, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error checking balance: ${error.message}`);
        }
        
        console.log("\n");
    }
}

runDiagnostic();
