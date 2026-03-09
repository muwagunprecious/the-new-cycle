const testAPI = async () => {
    try {
        console.log("---- Test 1: Missing Names (should return 400) ----");
        const res1 = await fetch("http://localhost:3000/api/verify-nin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nin: "12345678901" })
        });
        const text1 = await res1.text();
        console.log("Status:", res1.status);
        console.log("Response:", text1);
        console.log("");

        console.log("---- Test 2: With Names (should hit QoreID) ----");
        const res2 = await fetch("http://localhost:3000/api/verify-nin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nin: "12345678901", firstname: "John", lastname: "Doe" })
        });
        const text2 = await res2.text();
        console.log("Status:", res2.status);
        console.log("Response:", text2);
    } catch (e) {
        console.error("Test failed:", e.message);
    }
};

testAPI();
