import jwt from "jsonwebtoken";

/**
 * Sign a new access token
 * @param {object} payload - userId and role
 * @param {string} expiresIn - Token expiry (e.g., '1h', '1d')
 */
export function signToken(payload, expiresIn = "1h") {
    const SECRET = process.env.JWT_SECRET;
    if (!SECRET) {
        console.error("[JWT] CRITICAL: JWT_SECRET is not set in environment variables.");
        return null;
    }
    return jwt.sign(payload, SECRET, { expiresIn });
}

/**
 * Verify an access token
 * @param {string} token
 * @returns {object|null} - Decoded payload or null
 */
export function verifyToken(token) {
    const SECRET = process.env.JWT_SECRET;
    if (!token) return null;
    
    if (!SECRET) {
        console.error("[JWT] CRITICAL: JWT_SECRET is not set in environment variables. Verification failed.");
        return null;
    }

    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        // console.warn("[JWT] Verification failed:", error.message);
        return null;
    }
}
