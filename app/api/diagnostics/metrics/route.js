import { NextResponse } from 'next/server'
import { recordPageLoad } from '@/backend-actions/lib/diagnostics-store'

export async function POST(req) {
    try {
        const body = await req.json()
        const { page, duration } = body
        if (!page || !duration) return NextResponse.json({ ok: false })
        recordPageLoad(page, duration)
        return NextResponse.json({ ok: true })
    } catch {
        return NextResponse.json({ ok: false })
    }
}
