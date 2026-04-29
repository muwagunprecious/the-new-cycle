import { runEmergencyDBDiagnostic } from "@/backend-actions/actions/admin";
import { NextResponse } from "next/server";

export async function GET() {
    const data = await runEmergencyDBDiagnostic();
    return NextResponse.json(data);
}
