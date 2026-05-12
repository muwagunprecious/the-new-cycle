/**
 * Optimized HTTP client with connection pooling for external API calls.
 * Uses undici under the hood for better performance with keep-alive connections.
 */

import { fetch } from 'undici';

// Cache for QoreID access tokens to avoid re-authentication on every request
let qoreIdTokenCache = {
    token: null,
    expiresAt: 0
};

const DEFAULT_TIMEOUT = 15000; // 15 seconds

/**
 * Makes an HTTP request with optimized connection pooling
 * @param {string} url - The URL to fetch
 * @param {object} options - Fetch options
 * @param {number} timeout - Timeout in milliseconds
 */
export async function optimizedFetch(url, options = {}, timeout = DEFAULT_TIMEOUT) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Gets QoreID access token with caching to avoid repeated auth calls
 */
export async function getQoreIdToken() {
    const now = Date.now();

    // Return cached token if still valid (with 1 minute buffer)
    if (qoreIdTokenCache.token && qoreIdTokenCache.expiresAt > now + 60000) {
        return qoreIdTokenCache.token;
    }

    const clientId = process.env.QOREID_CLIENT_ID;
    const secretKey = process.env.QOREID_SECRET_KEY;

    if (!clientId || !secretKey) {
        throw new Error("Missing QoreID credentials in server environment");
    }

    const tokenRes = await optimizedFetch('https://api.qoreid.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, secret: secretKey }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokenData.message || 'Token failed');

    // Cache the token (QoreID tokens typically last 1 hour)
    qoreIdTokenCache = {
        token: tokenData.accessToken,
        expiresAt: now + (55 * 60 * 1000) // 55 minutes for safety
    };

    return tokenData.accessToken;
}

/**
 * Creates a cached fetch function for repeated API calls
 * @param {function} fetchFn - The fetch function to wrap
 * @param {number} ttl - Time to live in milliseconds
 */
export function createCachedFetch(fetchFn, ttl = 60000) {
    let cache = { data: null, timestamp: 0 };

    return async (...args) => {
        const now = Date.now();
        if (cache.data && (now - cache.timestamp) < ttl) {
            return cache.data;
        }
        const result = await fetchFn(...args);
        cache = { data: result, timestamp: now };
        return result;
    };
}