import prisma from "@/backend-actions/lib/prisma";
import { checkPhoneAvailability } from "@/backend-actions/actions/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const phone = searchParams.get("phone");

  // MODE: TEST VERIFY
  if (mode === "test-verify") {
    if (!phone) return NextResponse.json({ success: false, error: "Missing 'phone' parameter" });
    try {
      const result = await checkPhoneAvailability(phone);
      return NextResponse.json({ success: true, actionResult: result });
    } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  // MODE: REPAIR & NUKE
  if (mode === "nuke") {
    try {
      console.log("!!! INITIATING FULL DATABASE RECONSTRUCTION !!!");
      const repairs = [];
      const deletions = {};

      // 1. REPAIR USER TABLE
      const userColumns = [
        ["firstName", "TEXT"], ["lastName", "TEXT"], ["fullName", "TEXT"],
        ["businessName", "TEXT"], ["businessType", "TEXT"], ["ninDocument", "TEXT"],
        ["cacDocument", "TEXT"], ["bankName", "TEXT"], ["accountNumber", "TEXT"],
        ["accountName", "TEXT"], ["accountStatus", "TEXT DEFAULT 'pending'"],
        ["gender", "TEXT"], ["state", "TEXT DEFAULT 'Lagos'"], ["lga", "TEXT"],
        ["identityToken", "TEXT"], ["businessToken", "TEXT"], ["verificationNotes", "TEXT"],
        ["isDirectorVerified", "BOOLEAN DEFAULT false"], ["isPhoneVerified", "BOOLEAN DEFAULT false"],
        ["isEmailVerified", "BOOLEAN DEFAULT false"]
      ];

      for (const [col, type] of userColumns) {
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "${col}" ${type};`);
          repairs.push(`User:${col}`);
        } catch (err) { repairs.push(`User:Err:${col}:${err.message}`); }
      }

      // 2. REPAIR STORE TABLE
      const storeColumns = [
        ["bankName", "TEXT"], ["accountNumber", "TEXT"], ["accountName", "TEXT"],
        ["isVerified", "BOOLEAN DEFAULT false"], ["isDirectorVerified", "BOOLEAN DEFAULT false"],
        ["nin", "TEXT"], ["cac", "TEXT"], ["walletBalance", "DOUBLE PRECISION DEFAULT 0"],
        ["rejectionReason", "TEXT"], ["status", "TEXT DEFAULT 'pending'"],
        ["isActive", "BOOLEAN DEFAULT false"]
      ];

      for (const [col, type] of storeColumns) {
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "${col}" ${type};`);
          repairs.push(`Store:${col}`);
        } catch (err) { repairs.push(`Store:Err:${col}:${err.message}`); }
      }

      // 3. NUKE DATA
      const models = ["orderItem", "rating", "notification", "address", "order", "product", "store", "user", "setting", "coupon"];
      for (const model of models) {
        try {
          const result = await prisma[model].deleteMany({});
          deletions[model] = result.count;
        } catch (err) { deletions[model] = `Err:${err.message}`; }
      }

      return NextResponse.json({ success: true, message: "Multi-Table Reconstruction complete.", repairs, deletions });
    } catch (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
  }

  // STANDARD DIAGNOSTIC
  try {
    const settings = await prisma.setting.findMany({ select: { key: true, group: true } });
    return NextResponse.json({ success: true, settingsCount: settings.length, databaseUrlStatus: "Healthy" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
