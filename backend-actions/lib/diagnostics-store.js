/**
 * In-memory store for platform diagnostics.
 * Tracks active sessions, page load times, and API response times.
 * NOTE: Resets on server restart. For production persistence, use Redis or DB.
 */

const HEARTBEAT_TTL = 2 * 60 * 1000 // 2 minutes - user considered "active"

// { sessionId: { page, userId, role, lastSeen, ip } }
export const activeSessions = new Map()

// Ring buffer of last 100 page load events: { page, duration, timestamp, country }
export const pageLoadEvents = []
const MAX_PAGE_EVENTS = 100

// Ring buffer of last 100 API events: { route, duration, status, timestamp }
export const apiEvents = []
const MAX_API_EVENTS = 100

// Error log: { message, route, timestamp }
export const errorLog = []
const MAX_ERRORS = 50

export function recordHeartbeat(sessionId, data) {
    activeSessions.set(sessionId, {
        ...data,
        lastSeen: Date.now()
    })
    // Purge stale sessions
    for (const [id, session] of activeSessions) {
        if (Date.now() - session.lastSeen > HEARTBEAT_TTL) {
            activeSessions.delete(id)
        }
    }
}

export function recordPageLoad(page, duration, metadata = {}) {
    pageLoadEvents.unshift({ page, duration, timestamp: Date.now(), ...metadata })
    if (pageLoadEvents.length > MAX_PAGE_EVENTS) pageLoadEvents.pop()
}

export function recordApiCall(route, duration, status) {
    apiEvents.unshift({ route, duration, status, timestamp: Date.now() })
    if (apiEvents.length > MAX_API_EVENTS) apiEvents.pop()
}

export function recordError(message, route = '') {
    errorLog.unshift({ message, route, timestamp: Date.now() })
    if (errorLog.length > MAX_ERRORS) errorLog.pop()
}

export function getDiagnostics() {
    const now = Date.now()
    const active = [...activeSessions.values()].filter(s => now - s.lastSeen < HEARTBEAT_TTL)
    
    const avgPageLoad = pageLoadEvents.length > 0
        ? Math.round(pageLoadEvents.reduce((sum, e) => sum + e.duration, 0) / pageLoadEvents.length)
        : null

    const slowPages = pageLoadEvents
        .filter(e => e.duration > 2000)
        .slice(0, 10)
        .map(e => ({ page: e.page, duration: e.duration, timestamp: e.timestamp }))

    const avgApiTime = apiEvents.length > 0
        ? Math.round(apiEvents.reduce((sum, e) => sum + e.duration, 0) / apiEvents.length)
        : null

    const pageBreakdown = pageLoadEvents.reduce((acc, e) => {
        if (!acc[e.page]) acc[e.page] = { count: 0, total: 0 }
        acc[e.page].count++
        acc[e.page].total += e.duration
        return acc
    }, {})

    const pageStats = Object.entries(pageBreakdown)
        .map(([page, s]) => ({ page, avgMs: Math.round(s.total / s.count), visits: s.count }))
        .sort((a, b) => b.avgMs - a.avgMs)
        .slice(0, 8)

    return {
        activeUsers: active.length,
        activeSessions: active.map(s => ({
            page: s.page,
            role: s.role || 'visitor',
            lastSeen: s.lastSeen
        })),
        avgPageLoadMs: avgPageLoad,
        avgApiResponseMs: avgApiTime,
        slowPages,
        pageStats,
        recentErrors: errorLog.slice(0, 5),
        totalPageViews: pageLoadEvents.length,
        totalApiCalls: apiEvents.length,
        serverTime: new Date().toISOString()
    }
}
