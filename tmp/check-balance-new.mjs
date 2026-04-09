import https from 'https';

async function checkBalance() {
    const API_KEY = "TLpQZiLvPuhaPimTDDEHOTAuDuomZRVJqunQhIlIlzEfszgsqhAEioGsAImBwD";
    const ENDPOINT = `https://api.ng.termii.com/api/get-balance?api_key=${API_KEY}`;

    console.log(`--- Checking Account Balance for NEW Live API Key ---`);

    https.get(ENDPOINT, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
            responseData += chunk;
        });

        res.on('end', () => {
            console.log(`Response Status: ${res.statusCode}`);
            console.log(`Full Response Body: ${responseData}`);

            try {
                const data = JSON.parse(responseData);
                if (data.balance !== undefined) {
                    console.log(`\nAccount Balance: ${data.balance}`);
                    console.log(`Currency: ${data.currency}`);
                    console.log(`User: ${data.user}`);
                } else {
                    console.error("\nCould not retrieve balance. Response:", data);
                }
            } catch (err) {
                console.error("Failed to parse JSON response:", err.message);
            }
        });
    }).on('error', (err) => {
        console.error("❌ Request Error:", err.message);
    });
}

checkBalance();
