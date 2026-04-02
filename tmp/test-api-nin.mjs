import fetch from 'node-fetch';

async function testLocalVerifyNIN() {
    const nin = "63184876213"; // Sample NIN from docs
    const url = "http://localhost:3000/api/verify-nin";

    console.log(`Testing NIN Lookup: ${nin}`);
    
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nin })
        });

        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Local API Error:", error.message);
    }
}

testLocalVerifyNIN();
