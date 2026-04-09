import https from 'https';

async function checkSenderIds() {
    const API_KEY = "TLpQZiLvPuhaPimTDDEHOTAuDuomZRVJqunQhIlIlzEfszgsqhAEioGsAImBwD";
    const ENDPOINT = `https://api.ng.termii.com/api/sender-id?api_key=${API_KEY}`;

    console.log(`--- Checking Available Sender IDs for NEW Live API Key ---`);

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
                if (data.content && data.content.length > 0) {
                    console.log("\nApproved Sender IDs:");
                    data.content.forEach(s => {
                        console.log(`- ${s.sender_id} [${s.status}] (${s.country})`);
                    });
                } else {
                    console.log("\nNo Sender IDs found for this account.");
                    console.log("Tip: You must register a Sender ID in your Termii dashboard first.");
                }
            } catch (err) {
                console.error("Failed to parse JSON response:", err.message);
            }
        });
    }).on('error', (err) => {
        console.error("❌ Request Error:", err.message);
    });
}

checkSenderIds();
