import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

/**
 * Sign a new access token
 * @param {object} payload - userId and role
 * @param {string} expiresIn - Token expiry (e.g., '1h', '1d')
 */
export function signToken(payload, expiresIn = "1h") {
    if (!SECRET) {
        console.warn("JWT_SECRET is not set. Token signing skipped.");
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
    if (!SECRET || !token) return null;
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null;
    }
}
