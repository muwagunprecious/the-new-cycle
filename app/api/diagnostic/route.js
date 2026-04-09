import prisma from "@/backend/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  // NUKE MODE: Clears all data from the database
  if (mode === "nuke") {
    try {
      console.log("!!! INITIATING REMOTE DATABASE NUKE !!!");
      
      const deletions = {};
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
        const result = await prisma[model].deleteMany({});
        deletions[model] = result.count;
      }

      return NextResponse.json({
        success: true,
        message: "Database successfully nuke-reset from the cloud.",
        deletions
      });

    } catch (error) {
      return NextResponse.json({
        success: false,
        error: `Cloud Nuke Failed: ${error.message}`
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
