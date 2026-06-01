import { NextResponse } from "next/server";
import prisma from "@/backend-actions/lib/prisma";

// Submit a manual verification entry
export async function POST(req) {
  try {
    const { fullName, accountNumber, bankCode } = await req.json();
    if (!fullName || !accountNumber || !bankCode) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Save manual verification request to database
    const record = await prisma.manualVerification.create({
      data: {
        fullName,
        accountNumber,
        bankCode,
        status: "pending"
      }
    });

    console.log("Manual verification request saved:", record);
    return NextResponse.json({ success: true, message: "Manual verification submitted", data: record }, { status: 200 });
  } catch (e) {
    console.error("Manual verification POST error:", e);
    return NextResponse.json({ success: false, message: e.message || "Error processing request" }, { status: 500 });
  }
}

// Retrieve manual verification entries (for admin panel) with dynamically resolved seller details
export async function GET() {
  try {
    const verifications = await prisma.manualVerification.findMany({
      orderBy: { createdAt: "desc" }
    });

    // Resolve store profiles for each unique account number
    const accountNumbers = [...new Set(verifications.map(v => v.accountNumber))];
    const stores = await prisma.store.findMany({
      where: { accountNumber: { in: accountNumbers } },
      select: {
        name: true,
        email: true,
        contact: true,
        accountNumber: true
      }
    });

    // Merge store metadata with verification requests
    const enrichedVerifications = verifications.map(v => {
      const store = stores.find(s => s.accountNumber === v.accountNumber);
      return {
        ...v,
        storeName: store ? store.name : "N/A",
        storeEmail: store ? store.email : "N/A",
        storeContact: store ? store.contact : "N/A"
      };
    });

    return NextResponse.json({ success: true, data: enrichedVerifications }, { status: 200 });
  } catch (e) {
    console.error("Manual verification GET error:", e);
    return NextResponse.json({ success: false, message: e.message || "Error fetching records" }, { status: 500 });
  }
}

// Approve or reject manual verification entries
export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const updated = await prisma.manualVerification.update({
      where: { id },
      data: { status }
    });

    // If approved, update the store's bank details status to verified
    if (status === "approved") {
      await prisma.store.updateMany({
        where: { accountNumber: updated.accountNumber },
        data: { isVerified: true }
      });
    }

    return NextResponse.json({ success: true, message: `Manual verification ${status}`, data: updated }, { status: 200 });
  } catch (e) {
    console.error("Manual verification PATCH error:", e);
    return NextResponse.json({ success: false, message: e.message || "Error updating record" }, { status: 500 });
  }
}
