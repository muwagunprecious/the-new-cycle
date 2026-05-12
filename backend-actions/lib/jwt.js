import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    throw new Error("JWT_SECRET environment variable is required but not set");
}

/**
 * Sign a new access token
 * @param {object} payload - userId and role
 * @param {string} expiresIn - Token expiry (e.g., '1h', '1d')
 */
export function signToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, SECRET, { expiresIn });
}

/**
 * Verify an access token
 * @param {string} token
 * @returns {object|null} - Decoded payload or null
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null;
    }
}
