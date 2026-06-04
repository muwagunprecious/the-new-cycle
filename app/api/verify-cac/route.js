import { NextResponse } from "next/server";
import { verifyCAC } from "@/backend-actions/lib/qoreid";

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

        console.log(`Verifying CAC using library function: ${regNumber}`);
        const data = await verifyCAC(regNumber.trim());

        const isVerified = data.status === 'success' || 
                          data.status?.status === 'verified' || 
                          data.summary?.cac_check === 'verified' ||
                          data.summary?.status === 'VERIFIED';

        if (isVerified) {
            const businessData = data.cac || data.data || {};
            return NextResponse.json({
                success: true,
                companyName: businessData.companyName || businessData.entityName || data.companyName || "",
                rcNumber: businessData.rcNumber || businessData.regNumber || data.rcNumber || regNumber,
                companyType: businessData.companyType || businessData.entityType || data.companyType || "",
                status: businessData.status || data.status || "",
                branchAddress: businessData.branchAddress || businessData.address || data.address || "",
            });
        } else {
            console.log("QoreID CAC Verification Failed. Data:", JSON.stringify(data));
            return NextResponse.json({
                success: false,
                message: data.summary?.description || data.error || data.message || "Business verification failed. Please check the RC/BN/IT number and try again.",
            });
        }
    } catch (error) {
        console.error("QoreID CAC Route Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}
