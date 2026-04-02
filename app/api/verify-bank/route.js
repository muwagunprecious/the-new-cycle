import { NextResponse } from "next/server";

// Nigerian bank codes
const BANK_CODES = {
    "Access Bank": "044",
    "Citibank": "023",
    "Diamond Bank": "063",
    "Ecobank": "050",
    "Fidelity Bank": "070",
    "First Bank": "011",
    "First City Monument Bank (FCMB)": "214",
    "Guaranty Trust Bank (GTBank)": "058",
    "Heritage Bank": "030",
    "Jaiz Bank": "301",
    "Keystone Bank": "082",
    "Kuda Bank": "090267",
    "Moniepoint MFB": "50515",
    "OPay Digital Bank": "100004",
    "Palmpay": "100033",
    "Polaris Bank": "076",
    "Providus Bank": "101",
    "Stanbic IBTC Bank": "221",
    "Standard Chartered Bank": "068",
    "Sterling Bank": "232",
    "Suntrust Bank": "100",
    "Union Bank": "032",
    "United Bank for Africa (UBA)": "033",
    "Unity Bank": "215",
    "VFD Microfinance Bank": "566",
    "Wema Bank": "035",
    "Zenith Bank": "057"
};

export async function POST(req) {
    try {
        const { accountNumber, bankCode, firstname, lastname } = await req.json();

        if (!accountNumber || accountNumber.length < 10) {
            return NextResponse.json(
                { success: false, message: "Please provide a valid 10-digit account number." },
                { status: 400 }
            );
        }

        if (!bankCode) {
            return NextResponse.json(
                { success: false, message: "Please select a bank." },
                { status: 400 }
            );
        }

        // Test Mode Bypass
        if (accountNumber === "0000000000") {
            return NextResponse.json({
                success: true,
                accountName: "TEST ACCOUNT (GoCycle)",
                accountNumber: "0000000000"
            });
        }

        const BASE_URL = "https://api.qoreid.com";

        const getQoreIDToken = async () => {
            const clientId = process.env.QOREID_CLIENT_ID;
            const secretKey = process.env.QOREID_SECRET_KEY;

            console.log("Fetching QoreID Access Token for NUBAN...");
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
        const endpoint = `${BASE_URL}/v1/ng/identities/nuban`;

        console.log(`QoreID NUBAN Request: POST ${endpoint} — account: ${accountNumber}, bank: ${bankCode}`);

        const makeRequest = async () => {
            return await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    accountNumber,
                    bankCode,
                    firstname: (firstname && firstname !== 'N/A' ? firstname : ""),
                    lastname: (lastname && lastname !== 'N/A' ? lastname : "")
                }),
                signal: AbortSignal.timeout(30000) // Increased to 30s timeout
            });
        };

        let response;
        let retryCount = 0;
        const maxRetries = 1;

        while (retryCount <= maxRetries) {
            try {
                response = await makeRequest();
                
                // If it's a 500 error, retry once after a short delay
                if (response.status === 500 && retryCount < maxRetries) {
                    console.log(`QoreID returned 500. Retrying (${retryCount + 1}/${maxRetries}) after 2s...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    retryCount++;
                    continue;
                }
                
                break; // Break loop if we got a response (even if not ok, as long as not 500)
            } catch (err) {
                // Handle timeout specifically for retry
                if (err.name === 'TimeoutError' && retryCount < maxRetries) {
                    console.log(`QoreID Request Timed Out. Retrying (${retryCount + 1}/${maxRetries})...`);
                    retryCount++;
                    continue;
                }
                throw err; // Rethrow other errors to the main catch block
            }
        }

        const data = await response.json();

        if (!response.ok) {
            console.error("QoreID NUBAN API Failure:", {
                status: response.status,
                bankCode,
                accountNumber,
                data
            });

            // Special handling for 500 errors which are common for certain banks on QoreID (especially OPay)
            if (response.status === 500) {
                let errorMsg = "The bank provider is currently unavailable. Please try again in a few minutes or use a different bank.";
                
                if (bankCode === "100004") { // OPay
                    errorMsg = "OPay verification is currently experiencing downtime on the provider's end. Please double-check your account number or try a different bank.";
                } else if (bankCode === "100033") { // Palmpay
                    errorMsg = "Palmpay verification is currently experiencing regional downtime. Please try a different bank.";
                } else if (bankCode === "50515") { // Moniepoint
                    errorMsg = "Moniepoint MFB verification is currently experiencing downtime. Please try a different bank.";
                }

                return NextResponse.json(
                    {
                        success: false,
                        message: errorMsg,
                        debug: { originalError: data.message || "Internal Provider Error" }
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { success: false, message: data.message || `Account lookup failed (${response.status})` },
                { status: response.status }
            );
        }

        console.log("QoreID NUBAN API Success Response:", JSON.stringify(data, null, 2));

        // Handle specific Identity Mismatch from QoreID - BYPASS ENABLED
        if (data.status?.status === "id_mismatch" || data.summary?.nuban_check?.status === "NO_MATCH") {
            // Soft-fail: Accept the account as valid but with a mismatch warning
            console.warn("KYC Mismatch Bypassed for:", accountNumber);
            return NextResponse.json({
                success: true,
                accountName: `${data.applicant?.firstname || firstname || ''} ${data.applicant?.lastname || lastname || ''}`.trim() + " (Unverified Match)",
                accountNumber: data.applicant?.accountNumber || accountNumber,
                message: "Account found, but the spelling of the name is an unverified match.",
            });
        }

        // Try to extract the account name from various possible QoreID payload structures
        let accountName = data.nuban?.accountName || data.accountName || data.data?.accountName;

        // If no explicit account name was returned but the check passed/completed successfully, use the provided matched names
        if (!accountName && data.status?.state === "complete" && data.applicant) {
            accountName = `${data.applicant.firstname || ''} ${data.applicant.lastname || ''}`.trim();
        }

        if (accountName) {
            return NextResponse.json({
                success: true,
                accountName: accountName,
                accountNumber: data.applicant?.accountNumber || data.nuban?.accountNumber || accountNumber,
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "Could not resolve account details. Please check your bank and account number.",
            });
        }

    } catch (error) {
        console.error("QoreID NUBAN API EXCEPTION:", {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        const isTimeout = error.name === 'TimeoutError' || error.message.includes('aborted');
        
        return NextResponse.json(
            { 
                success: false, 
                message: isTimeout 
                    ? "The bank's server is responding too slowly. Please try again or use a different bank." 
                    : "Verification service error. Please try again later.",
                debug: error.message 
            },
            { status: 500 }
        );
    }
}

// GET endpoint to return list of banks
export async function GET() {
    return NextResponse.json({ banks: BANK_CODES });
}
