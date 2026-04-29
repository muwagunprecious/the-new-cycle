import { NextResponse } from 'next/server'
import { getDiagnostics } from '@/backend-actions/lib/diagnostics-store'

export async function GET() {
    try {
        const data = getDiagnostics()
        return NextResponse.json({ success: true, data })
    } catch (e) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
