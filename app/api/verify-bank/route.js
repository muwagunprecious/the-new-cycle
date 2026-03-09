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

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                accountNumber,
                bankCode,
                firstname: (firstname && firstname !== 'N/A' ? firstname : "Go"),
                lastname: (lastname && lastname !== 'N/A' ? lastname : "Cycle")
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("QoreID NUBAN API Failure:", {
                status: response.status,
                bankCode,
                accountNumber,
                data
            });

            // Special handling for 500 errors which are common for certain banks on QoreID
            if (response.status === 500) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "The bank provider is currently unavailable or the account number is invalid for this bank. Please double-check the bank and account number."
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { success: false, message: data.message || `Account lookup failed (${response.status})` },
                { status: response.status }
            );
        }

        if (data.nuban?.accountName) {
            return NextResponse.json({
                success: true,
                accountName: data.nuban.accountName,
                accountNumber: data.nuban.accountNumber || accountNumber,
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "Could not resolve account name. Please check your bank and account number.",
            });
        }
    } catch (error) {
        console.error("QoreID NUBAN Error:", error);
        return NextResponse.json(
            { success: false, message: "Verification service error. Please try again later." },
            { status: 500 }
        );
    }
}

// GET endpoint to return list of banks
export async function GET() {
    return NextResponse.json({ banks: BANK_CODES });
}
