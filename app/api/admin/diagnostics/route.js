import { NextResponse } from 'next/server'
import { getDiagnostics } from '../../../../backend-actions/lib/diagnostics-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
    try {
        const data = getDiagnostics()
        return NextResponse.json({ success: true, data })
    } catch (e) {
        console.error('[Diagnostics API] Error:', e)
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}
