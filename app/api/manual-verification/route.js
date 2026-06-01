import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { fullName, accountNumber, bankCode } = await req.json();
    if (!fullName || !accountNumber || !bankCode) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }
    // In a real app, you would store this for admin review or trigger a workflow.
    console.log("Manual verification request received:", { fullName, accountNumber, bankCode });
    return NextResponse.json({ success: true, message: "Manual verification submitted" }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message || "Error processing request" }, { status: 500 });
  }
}
