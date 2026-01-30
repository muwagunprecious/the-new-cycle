const { registerUser } = require('./backend/actions/auth');

async function testRegister() {
    const email = `test_${Date.now()}@example.com`;
    console.log("Testing registration for:", email);
    try {
        const result = await registerUser({
            name: "Test User",
            email: email,
            password: "password123",
            role: "BUYER",
            whatsapp: "+234 800-0000-000"
        });
        console.log("Result:", result);
    } catch (error) {
        console.error("Error:", error);
    }
}

testRegister();
