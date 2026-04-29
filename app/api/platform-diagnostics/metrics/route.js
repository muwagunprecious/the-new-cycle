import { NextResponse } from 'next/server'
import { recordPageLoad } from '@/backend-actions/lib/diagnostics-store'

export const dynamic = 'force-dynamic'

export async function POST(req) {
    try {
        console.log('[Metrics] Request received')
        
        const body = await req.json().catch(() => ({}))
        const { page, duration } = body
        
        if (!page || !duration) {
            return NextResponse.json({ ok: false, error: 'Missing data' }, { status: 200 })
        }
        
        recordPageLoad(page, duration)
        return NextResponse.json({ ok: true })
    } catch (error) {
        console.error('[Metrics] Server Error:', error)
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
}
