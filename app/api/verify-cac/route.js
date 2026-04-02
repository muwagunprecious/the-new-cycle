import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { regNumber } = await req.json();

        if (!regNumber || regNumber.trim().length < 3) {
            return NextResponse.json(
                { success: false, message: "Please provide a valid RC/BN/IT number." },
                { status: 400 }
            );
        }

        // Test Mode Bypass
        if (regNumber.trim() === "RC0000000") {
            return NextResponse.json({
                success: true,
                companyName: "TEST BUSINESS (GoCycle)",
                rcNumber: "RC0000000",
                companyType: "Private Limited Company",
                status: "ACTIVE",
                branchAddress: "123 Test Street, Lagos",
            });
        }

        const BASE_URL = "https://api.qoreid.com";

        // Get QoreID token
        const getQoreIDToken = async () => {
            const clientId = process.env.QOREID_CLIENT_ID;
            const secretKey = process.env.QOREID_SECRET_KEY;

            console.log("Fetching QoreID Access Token for CAC...");
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
        const endpoint = `${BASE_URL}/v1/ng/identities/cac-premium`;

        console.log(`QoreID CAC Request: POST ${endpoint} — regNumber: ${regNumber}`);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ regNumber: regNumber.trim() }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("QoreID CAC API Failure:", {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
            return NextResponse.json(
                { success: false, message: data.message || `CAC verification failed (${response.status})` },
                { status: response.status }
            );
        }

        const cacStatus = data.summary?.cac_check;

        if (cacStatus === "verified") {
            return NextResponse.json({
                success: true,
                companyName: data.cac?.companyName || "",
                rcNumber: data.cac?.rcNumber || regNumber,
                companyType: data.cac?.companyType || "",
                status: data.cac?.status || "",
                branchAddress: data.cac?.branchAddress || "",
            });
        } else {
            console.log("QoreID CAC Status:", cacStatus, "Data:", JSON.stringify(data.summary));
            return NextResponse.json({
                success: false,
                message: "Business verification failed. Please check the RC/BN/IT number and try again.",
            });
        }
    } catch (error) {
        console.error("QoreID CAC Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
