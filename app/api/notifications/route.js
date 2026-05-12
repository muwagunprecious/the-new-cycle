import { NextResponse } from 'next/server'
import prisma from '@/backend-actions/lib/prisma'
import { verifyToken } from '@/backend-actions/lib/jwt'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Cache for recent notification check to reduce DB load
const notificationCache = new Map();
const CACHE_TTL = 5000; // 5 seconds

// Cleanup function - runs asynchronously, doesn't block requests
let cleanupScheduled = false;
function scheduleCleanup() {
    if (cleanupScheduled) return;
    cleanupScheduled = true;
    setTimeout(() => {
        const now = Date.now();
        let cleaned = 0;
        for (const [key, value] of notificationCache) {
            if (now - value.timestamp > CACHE_TTL) {
                notificationCache.delete(key);
                cleaned++;
            }
        }
        if (cleaned > 0) console.log(`[Notifications] Cleaned ${cleaned} stale cache entries`);
        cleanupScheduled = false;
    }, 60000); // Cleanup every minute
}

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

        // Check cache first to avoid unnecessary DB queries
        const cacheKey = `notifications_${decoded.userId}`;
        const cached = notificationCache.get(cacheKey);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
            scheduleCleanup(); // Schedule async cleanup
            return NextResponse.json({ success: true, notifications: cached.data });
        }

        const where = {
            userId: decoded.userId,
            type: { in: ['ORDER', 'RESCHEDULE'] },
            status: 'unread'
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 10,
        })

        // Cache the result
        notificationCache.set(cacheKey, { data: notifications, timestamp: now });
        scheduleCleanup(); // Schedule async cleanup
        
        return NextResponse.json({ success: true, notifications })
    } catch (error) {
        console.error('[Notifications API] Error:', error.message)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
