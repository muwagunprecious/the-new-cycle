import { NextResponse } from 'next/server'
import { verifyToken } from '@/backend-actions/lib/jwt'
import { cookies } from 'next/headers'
import prisma from '@/backend-actions/lib/prisma'

export async function POST(request) {
    try {
        // Verify admin/seller authentication
        const cookieStore = await cookies()
        const token = cookieStore.get('gocycle_auth_token')?.value
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyToken(token)
        if (!decoded?.userId) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        }

        // Only sellers can receive notifications (or admins for monitoring)
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, role: true }
        })

        if (!user || (!['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role))) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        const { sellerId, buyerName, productName, amount, collectionDate, verificationCode } = await request.json()

        // Verify the sellerId matches the authenticated user (security)
        if (sellerId !== decoded.userId && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        // Create a real-time notification for the seller
        const notification = await prisma.notification.create({
            data: {
                userId: sellerId,
                type: 'ORDER',
                status: 'unread',
                title: 'New Purchase Request',
                message: `New order from ${buyerName} for ${productName}. Amount: ₦${amount.toLocaleString()}. Verification code: ${verificationCode}. Collection date: ${collectionDate || 'TBD'}`,
            }
        })

        // In a production app with WebSocket support, you would emit to a socket here
        // For now, we rely on polling via /api/notifications

        return NextResponse.json({ success: true, notification })
    } catch (error) {
        console.error('[Notify Seller API] Error:', error.message)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}