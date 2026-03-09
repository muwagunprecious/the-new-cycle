const testAPI = async () => {
    try {
        console.log("---- Test 1: Missing Names ----");
        const res1 = await fetch("http://localhost:3000/api/verify-nin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nin: "12345678901" })
        });
        console.log("Status:", res1.status);
        console.log("Response:", await res1.json());

        console.log("\n---- Test 2: Mismatched Names ----");
        const res2 = await fetch("http://localhost:3000/api/verify-nin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nin: "12345678901", firstname: "Wrong", lastname: "Name" })
        });
        console.log("Status:", res2.status);
        console.log("Response:", await res2.json());

    } catch (e) {
        console.error("Test failed:", e);
    }
};

testAPI();
