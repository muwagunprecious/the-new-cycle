import { NextResponse } from "next/server";
import { getQoreIdToken, optimizedFetch } from "@/backend-actions/lib/http-client";

export async function POST(req) {
    try {
        const body = await req.json();
        const { nin, firstname, lastname } = body;

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



        // Get cached QoreID token (avoids re-authentication delay on every request)
        const API_KEY = await getQoreIdToken();
        const endpoint = `https://api.qoreid.com/v1/ng/identities/nin/${nin}`;

        // Send provided names for matching
        const payload = {
            firstname: firstname.trim(),
            lastname: lastname.trim()
        };

        // Use optimized fetch with connection pooling and timeout
        const response = await optimizedFetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }, 15000);

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, message: data.message || `Verification server error (${response.status})` },
                { status: response.status }
            );
        }

        // Name matching validation
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
                debug: {
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
                debug: { error: error.message }
            },
            { status: 500 }
        );
    }
}