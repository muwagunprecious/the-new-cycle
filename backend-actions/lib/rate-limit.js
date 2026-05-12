const trackers = new Map();

/**
 * Cleanup stale entries periodically to prevent memory bloat
 */
function cleanupTrackers() {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, state] of trackers) {
        if (now - state.startTime > 120000) { // Older than 2 minutes
            trackers.delete(key);
            cleaned++;
        }
    }
    if (cleaned > 0) console.log(`[RateLimit] Cleaned ${cleaned} stale entries`);
}

// Cleanup every 5 minutes
setInterval(cleanupTrackers, 5 * 60 * 1000);

/**
 * @param {string} key - Unique identifier (e.g., IP or User ID)
 * @param {number} limit - Max requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Returns true if allowed, false if rate limited
 */
export function isAllowed(key, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const state = trackers.get(key) || { count: 0, startTime: now };

    // Reset window if expired
    if (now - state.startTime > windowMs) {
        state.count = 1;
        state.startTime = now;
    } else {
        state.count++;
    }

    trackers.set(key, state);

    return state.count <= limit;
}

/**
 * Rate Limit Decorator for Server Actions
 */
export async function rateLimit(key, limit = 10) {
    if (!isAllowed(key, limit)) {
        throw new Error("Too many requests. Please try again later.");
    }
}
