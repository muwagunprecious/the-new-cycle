import { NextResponse } from 'next/server'
import { recordHeartbeat } from '@/backend-actions/lib/diagnostics-store'

export const dynamic = 'force-dynamic'

export async function POST(req) {
    try {
        // Log to verify it's being called
        console.log('[Heartbeat] Request received')
        
        const body = await req.json().catch(() => ({}))
        const { sessionId, page, role } = body
        
        if (!sessionId) {
            return NextResponse.json({ ok: false, error: 'Missing sessionId' }, { status: 200 }) // Return 200 to avoid 404 confusion
        }
        
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
        recordHeartbeat(sessionId, { page, role, ip })
        
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[Heartbeat] Server Error:', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}
