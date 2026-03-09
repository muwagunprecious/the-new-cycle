import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { nin, firstname, lastname } = await req.json();

        if (!nin || nin.length !== 11) {
            return NextResponse.json(
                { success: false, message: "Invalid NIN. Must be 11 digits." },
                { status: 400 }
            );
        }

        if (!firstname || !lastname) {
            return NextResponse.json(
                { success: false, message: "First name and last name are required for matching." },
                { status: 400 }
            );
        }

        // QoreID "NIN (With NIN)" service requires names for matching.

        const BASE_URL = "https://api.qoreid.com";

        // Helper to get token if needed
        const getQoreIDToken = async () => {
            const clientId = process.env.QOREID_CLIENT_ID;
            const secretKey = process.env.QOREID_SECRET_KEY;

            console.log("Fetching QoreID Access Token...");
            const tokenRes = await fetch(`${BASE_URL}/token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientId, secret: secretKey }),
            });
            const tokenData = await tokenRes.json();
            if (!tokenRes.ok) throw new Error(tokenData.message || "Token exchange failed");
            return tokenData.accessToken;
        };

        const API_KEY = await getQoreIDToken();
        const endpoint = `${BASE_URL}/v1/ng/identities/nin/${nin}`;

        console.log(`QoreID Request: POST ${endpoint}`);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstname: firstname || "",
                lastname: lastname || ""
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("QoreID API Failure:", {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            return NextResponse.json(
                { success: false, message: data.message || `Verification server error (${response.status})` },
                { status: response.status }
            );
        }

        const matchStatus = data.summary?.nin_check?.status;

        // Accept EXACT_MATCH and TRANSPOSED_MATCH (names matched but in swapped order)
        const isMatch = matchStatus === "EXACT_MATCH" || matchStatus === "TRANSPOSED_MATCH";
        if (isMatch) {
            return NextResponse.json({
                success: true,
                firstname: data.applicant?.firstname || firstname,
                lastname: data.applicant?.lastname || lastname,
                matchStatus: matchStatus
            });
        } else {
            console.log("QoreID Match Status:", matchStatus, "Data:", JSON.stringify(data.summary?.nin_check));
            return NextResponse.json({
                success: false,
                message: `Identity mismatch: The names provided do not match the NIN records.`,
            });
        }
    } catch (error) {
        console.error("QoreID Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
