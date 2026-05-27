import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { fullName, accountNumber, bankCode } = await req.json();
    // In a real system you would store this info for admin review.
    console.log("Manual verification request:", { fullName, accountNumber, bankCode });
    return NextResponse.json({
      success: true,
      message: "Your name has been received. An admin will review the information and contact you."
    });
  } catch (err) {
    console.error("Manual verification error:", err);
    return NextResponse.json({ success: false, message: "Failed to submit manual verification" }, { status: 500 });
  }
}
