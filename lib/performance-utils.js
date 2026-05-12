/**
 * Server-side performance optimizations for Next.js
 * Add to next.config.js under experimental
 */

// In next.config.js, add:
// experimental: {
//   serverComponentsExternalPackages: ['undici'],
// }

/**
 * Recommended Vercel optimizations:
 * 
 * 1. DATABASE_URL should use connection pooling (already configured)
 *    ?pgbouncer=true&connection_limit=10&pool_timeout=30
 * 
 * 2. Enable ISR caching for public pages with revalidate
 * 
 * 3. Use React Cache for frequently accessed data
 * 
 * 4. Consider Vercel Edge Config for rate limiting state
 */

// Cache utility for React Server Components
export function createCache() {
    const cache = new Map();
    
    return {
        get: (key) => cache.get(key),
        set: (key, value, ttl = 60000) => {
            cache.set(key, { value, expires: Date.now() + ttl });
        },
        getOrSet: async (key, fn, ttl = 60000) => {
            const cached = cache.get(key);
            if (cached && cached.expires > Date.now()) {
                return cached.value;
            }
            const value = await fn();
            cache.set(key, value, ttl);
            return value;
        }
    };
}