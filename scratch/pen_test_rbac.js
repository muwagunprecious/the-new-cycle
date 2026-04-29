/**
 * Pen-Testing Script: RBAC & Zero Trust Verification
 */

const jwt = require('jsonwebtoken');
const SECRET = "gocycle_secure_session_secret_2026_rbac_hardened";

// Mock payloads
const superAdminToken = jwt.sign({ userId: 'super_admin_demo', role: 'SUPER_ADMIN' }, SECRET);
const userToken = jwt.sign({ userId: 'buyer_demo', role: 'USER' }, SECRET);
const spoofedAdminToken = jwt.sign({ userId: 'buyer_demo', role: 'ADMIN' }, SECRET); // USER trying to be ADMIN

console.log("--- ZERO TRUST PEN-TESTING ---");

async function testAuthorize() {
    // Note: We'd need a real DB connection to test the actual 'authorize' function.
    // Since this is a standalone script, we simulate the logic.
    
    console.log("\n[TEST 1] Legitimate SUPER_ADMIN Token");
    verifySimulation(superAdminToken, ['SUPER_ADMIN', 'ADMIN'], 'SUPER_ADMIN'); // Role in DB is SUPER_ADMIN

    console.log("\n[TEST 2] Privilege Escalation Attempt (Spoofed ADMIN role for USER)");
    verifySimulation(spoofedAdminToken, ['ADMIN'], 'USER'); // Role in DB is USER

    console.log("\n[TEST 3] Unauthorized Role (USER accessing ADMIN route)");
    verifySimulation(userToken, ['ADMIN'], 'USER'); // Role in DB is USER
}

function verifySimulation(token, allowedRoles, dbRole) {
    try {
        const decoded = jwt.verify(token, SECRET);
        console.log(`- Token Verified. userId: ${decoded.userId}, jwtRole: ${decoded.role}`);
        
        // Simulate DB Fetch
        console.log(`- DB Fetch: Current role for ${decoded.userId} is ${dbRole}`);

        // Cross-check
        if (decoded.role !== dbRole) {
            console.log("❌ [SECURITY INCIDENT] Role mismatch detected! Access Denied.");
            return;
        }

        // RBAC Check
        if (!allowedRoles.includes(dbRole)) {
            console.log(`❌ [ACCESS DENIED] Role ${dbRole} not in whitelist ${JSON.stringify(allowedRoles)}`);
            return;
        }

        console.log("✅ [ACCESS GRANTED] Request authorized.");
    } catch (e) {
        console.log("❌ [INVALID TOKEN] Verification failed.");
    }
}

testAuthorize();
