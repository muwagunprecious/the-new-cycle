import { NextResponse } from 'next/server'
import prisma from '@/backend-actions/lib/prisma'
import { verifyToken } from '@/backend-actions/lib/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/**
 * GET /api/notifications?since=<ISO timestamp>
 * Returns ORDER-type notifications for the authenticated user
 * created after the `since` timestamp. Used for polling.
 */
export async function GET(req) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('gocycle_auth_token')?.value
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded?.userId) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        }

        const where = {
            userId: decoded.userId,
            type: 'ORDER',
            status: 'unread'
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 10,
        })

        return NextResponse.json({ success: true, notifications })
    } catch (error) {
        console.error('[Notifications API] Error:', error.message)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
