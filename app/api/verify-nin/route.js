import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
    try {
        const body = await req.json();
        const { nin, firstname, lastname } = body;
        
        console.log("NIN Request Body:", JSON.stringify(body));

        const logPath = path.join(process.cwd(), "tmp", "qoreid-debug.log");
        console.log("Saving debug log to:", logPath);

        if (!nin || nin.length !== 11) {
            return NextResponse.json(
                { success: false, message: "Invalid NIN. Must be 11 digits." },
                { status: 400 }
            );
        }

        // Test Mode Bypass
        if (nin === "70123456789") {
            return NextResponse.json({
                success: true,
                firstname: firstname || "TEST",
                lastname: lastname || "USER",
                matchStatus: "EXACT_MATCH"
            });
        }

        // QoreID "NIN (With NIN)" service
        const BASE_URL = "https://api.qoreid.com";

        // Helper to get token
        const getQoreIDToken = async () => {
            const clientId = process.env.QOREID_CLIENT_ID;
            const secretKey = process.env.QOREID_SECRET_KEY;

            if (!clientId || !secretKey) {
                console.error("Missing QoreID credentials in .env");
                throw new Error("Missing QoreID credentials in server environment");
            }

            console.log("Fetching QoreID token for client:", clientId.substring(0, 5) + "...");
            
            const tokenRes = await fetch(`${BASE_URL}/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId, secret: secretKey }),
                // Add a reasonable timeout
                signal: AbortSignal.timeout(10000) 
            });
            const tokenData = await tokenRes.json();
            if (!tokenRes.ok) throw new Error(tokenData.message || "Token failed");
            return tokenData.accessToken;
        };

        const API_KEY = await getQoreIDToken();
        const endpoint = `${BASE_URL}/v1/ng/identities/nin/${nin}`;

        // Send provided names for matching
        const payload = {
            firstname: firstname.trim(),
            lastname: lastname.trim()
        };

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        
        // DEBUG: Write full response to file
        try {
            fs.appendFileSync(logPath, `\n\n--- ${new Date().toISOString()} ---\n` + JSON.stringify(data, null, 2));
        } catch (e) {
            console.error("Failed to write log file:", e);
        }

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || `Verification server error (${response.status})` },
                { status: response.status }
            );
        }

        // 4. Force name matching (Lookup mode is disabled)
        if (!firstname || !lastname) {
            return NextResponse.json(
                { success: false, message: "First name and last name are required for NIN verification." },
                { status: 400 }
            );
        }

        // Robust name extraction
        const getBiodataValue = (obj, keys) => {
            if (!obj) return null;
            for (const key of keys) {
                const val = obj[key];
                if (val && typeof val === 'string' && val.length > 0) {
                    return val;
                }
            }
            return null;
        };

        const bioRoot = data.nin || data.applicant || data.summary?.nin_check?.applicant || data;
        const fetchedFirst = getBiodataValue(bioRoot, ['firstname', 'first_name', 'firstName']);
        const fetchedLast = getBiodataValue(bioRoot, ['lastname', 'last_name', 'lastName']);

        // Verification Mode: Match names
        const matchStatus = data.summary?.nin_check?.status;
        const isMatch = matchStatus === "EXACT_MATCH" || matchStatus === "TRANSPOSED_MATCH";
        
        if (isMatch) {
            return NextResponse.json({
                success: true,
                firstname: fetchedFirst || firstname,
                lastname: fetchedLast || lastname,
                matchStatus: matchStatus
            });
        } else {
            return NextResponse.json({
                success: false,
                message: `Identity mismatch: The names provided do not match the NIN records.`,
                debug: { // Add debug info to help troubleshoot
                    matchStatus,
                    fetchedFirst,
                    fetchedLast
                }
            });
        }
    } catch (error) {
        console.error("QoreID Route Error:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Internal server error during verification.",
                debug: { error: error.message, stack: error.stack?.split('\n')[0] }
            },
            { status: 500 }
        );
    }
}
