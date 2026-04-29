import { NextResponse } from 'next/server'
import { recordHeartbeat } from '@/backend-actions/lib/diagnostics-store'

export async function POST(req) {
    try {
        const body = await req.json()
        const { sessionId, page, role } = body
        if (!sessionId) return NextResponse.json({ ok: false })
        
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
        recordHeartbeat(sessionId, { page, role, ip })
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ ok: false })
    }
}
