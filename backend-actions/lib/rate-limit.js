/**
 * Simple In-Memory Rate Limiter
 * Suitable for single-instance deployments.
 */

const trackers = new Map();

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
