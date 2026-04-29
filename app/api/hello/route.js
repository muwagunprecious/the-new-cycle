import { NextResponse } from 'next/server'
import { recordHeartbeat } from '@/backend-actions/lib/diagnostics-store'

export async function GET() {
    console.log('RecordHeartbeat:', typeof recordHeartbeat)
    return NextResponse.json({ message: 'Hello from API with import' })
}
