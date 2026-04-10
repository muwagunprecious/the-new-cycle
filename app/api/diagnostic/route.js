import prisma from "@/backend/lib/prisma";
import { checkPhoneAvailability } from "@/backend/actions/auth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");
  const phone = searchParams.get("phone");

  // MODE: TEST VERIFY (Isolated Action Test)
  if (mode === "test-verify") {
    if (!phone) return NextResponse.json({ success: false, error: "Missing 'phone' parameter" });
    
    try {
      console.log(`[ACTION TEST] Testing checkPhoneAvailability for: ${phone}`);
      const result = await checkPhoneAvailability(phone);
      return NextResponse.json({
        success: true,
        message: "Action test completed",
        actionResult: result
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: "Action test crashed",
        error: error.message
      }, { status: 500 });
    }
  }

  // MODE: REPAIR & NUKE
  if (mode === "nuke") {
    try {
      console.log("!!! INITIATING FULL REMOTE SCHEMA RECONSTRUCTION & NUKE !!!");
      
      const repairs = [];
      const deletions = {};

      // 1. COMPREHENSIVE USER TABLE REPAIR
      const columnsToAdd = [
        ["firstName", "TEXT"],
        ["lastName", "TEXT"],
        ["fullName", "TEXT"],
        ["businessName", "TEXT"],
        ["businessType", "TEXT"],
        ["ninDocument", "TEXT"],
        ["cacDocument", "TEXT"],
        ["bankName", "TEXT"],
        ["accountNumber", "TEXT"],
        ["accountName", "TEXT"],
        ["accountStatus", "TEXT DEFAULT 'pending'"],
        ["gender", "TEXT"],
        ["state", "TEXT DEFAULT 'Lagos'"],
        ["lga", "TEXT"],
        ["identityToken", "TEXT"],
        ["businessToken", "TEXT"],
        ["verificationNotes", "TEXT"],
        ["isDirectorVerified", "BOOLEAN DEFAULT false"],
        ["isPhoneVerified", "BOOLEAN DEFAULT false"],
        ["isEmailVerified", "BOOLEAN DEFAULT false"]
      ];

      for (const [col, type] of columnsToAdd) {
        try {
          await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "${col}" ${type};`);
          repairs.push(`Verified/Added: ${col}`);
        } catch (err) {
          repairs.push(`Failed/Skipped ${col}: ${err.message}`);
        }
      }

      // 2. NUKE DATA
      const models = [
        "orderItem", "rating", "notification", "address", "order", 
        "product", "store", "user", "setting", "coupon"
      ];

      for (const model of models) {
        try {
          const result = await prisma[model].deleteMany({});
          deletions[model] = result.count;
        } catch (delErr) {
          deletions[model] = `Error: ${delErr.message}`;
        }
      }

      return NextResponse.json({
        success: true,
        message: "Full Schema Reconstruction complete. Data cleared.",
        repairs,
        deletions
      });

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: `Cloud Reconstruction Failed: ${error.message}`
      }, { status: 500 });
    }
  }

  // STANDARD DIAGNOSTIC MODE
  try {
    const settings = await prisma.setting.findMany({ select: { key: true, group: true } });
    return NextResponse.json({
      success: true,
      settingsCount: settings.length,
      databaseUrlStatus: "Healthy"
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
