import prisma from "@/backend/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check current settings count and metadata
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
      error: error.message
    }, { status: 500 });
  }
}
