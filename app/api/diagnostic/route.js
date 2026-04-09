import prisma from "@/backend/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  // MODE: REPAIR & NUKE
  if (mode === "nuke") {
    try {
      console.log("!!! INITIATING REMOTE SCHEMA REPAIR & NUKE !!!");
      
      const repairs = [];
      const deletions = {};

      // 1. REPAIR MISSING COLUMNS
      try {
        console.log("Repairing Users table schema...");
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lastName" TEXT;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "fullName" TEXT;`);
        repairs.push("Successfully added missing firstName, lastName, and fullName columns.");
      } catch (err) {
        repairs.push(`Schema Repair Skip/Error: ${err.message}`);
      }

      // 2. NUKE DATA
      const models = [
        "orderItem",
        "rating",
        "notification",
        "address",
        "order",
        "product",
        "store",
        "user",
        "setting",
        "coupon"
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
        message: "Database schema repaired and data cleared from the cloud.",
        repairs,
        deletions
      });

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: `Cloud Reset Failed: ${error.message}`
      }, { status: 500 });
    }
  }

  // STANDARD DIAGNOSTIC MODE
  try {
    const settings = await prisma.setting.findMany({ 
      select: { key: true, group: true } 
    });

    return NextResponse.json({
      success: true,
      settingsCount: settings.length,
      settingsSummary: settings.map(s => `${s.group}:${s.key}`),
      databaseUrlStatus: "Healthy (Direct Connection 5432)"
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Diagnostic Failed: ${error.message}`
    }, { status: 500 });
  }
}
