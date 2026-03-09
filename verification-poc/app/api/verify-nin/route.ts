import { NextResponse } from "next/server";

/**
 * QoreID NIN Verification API Route
 * Endpoint: POST /api/verify-nin
 */
export async function POST(req: Request) {
    try {
        const { nin, firstname, lastname } = await req.json();

        // 1. Validate Input
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

        // 2. Check API Key
        const API_KEY = process.env.QOREID_TEST_KEY;
        if (!API_KEY) {
            console.error("QOREID_TEST_KEY is missing in environment variables.");
            return NextResponse.json(
                { success: false, message: "Server configuration error. Missing API Key." },
                { status: 500 }
            );
        }

        const BASE_URL = "https://api.qoreid.com";
        const endpoint = `${BASE_URL}/v1/ng/identities/nin/${nin}`;

        // 3. Call QoreID API
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstname,
                lastname,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || "Verification failed at QoreID." },
                { status: response.status }
            );
        }

        // 4. Verify Match Status
        // Based on QoreID Docs: summary.nin_check.status === "EXACT_MATCH"
        const matchStatus = data.summary?.nin_check?.status;

        if (matchStatus === "EXACT_MATCH") {
            return NextResponse.json({
                success: true,
                firstname: data.nin?.firstname || firstname,
                lastname: data.nin?.lastname || lastname,
            });
        } else {
            return NextResponse.json({
                success: false,
                message: `Verification mismatch: ${matchStatus || "No match found"}.`,
            });
        }
    } catch (error: any) {
        console.error("NIN Verification Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error during verification." },
            { status: 500 }
        );
    }
}
