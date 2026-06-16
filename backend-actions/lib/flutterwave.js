/**
 * Flutterwave VP4 Integration Library for Go-Cycle
 *
 * Server-side helper for verifying Flutterwave transactions.
 * Uses Flutterwave VP4 (v4) OAuth 2.0 — exchanges client_id + client_secret
 * for a short-lived bearer token, then uses that token for API calls.
 *
 * Token is cached in-memory and auto-refreshed when it expires.
 *
 * NOTE: No 'use server' directive here — this is a utility library
 * imported by both server actions and API routes.
 */

const FLW_BASE_URL = process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3'
const FLW_CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID
const FLW_CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET

// Legacy v3 secret key (kept as fallback if OAuth fails)
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY

// VP4 OAuth Token endpoint
const FLW_TOKEN_URL = 'https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token'

// In-memory token cache
let _tokenCache = { token: null, expiresAt: 0 }

/**
 * Get a valid VP4 OAuth 2.0 access token.
 * Fetches a new token only when the cached one is expired or missing.
 * Tokens typically last 10 minutes; we refresh 60 seconds before expiry.
 *
 * @returns {Promise<string>} A valid bearer access token
 */
async function getV4AccessToken() {
    const now = Date.now()

    // Return cached token if still valid (with 60s buffer)
    if (_tokenCache.token && now < _tokenCache.expiresAt - 60_000) {
        return _tokenCache.token
    }

    if (!FLW_CLIENT_ID || !FLW_CLIENT_SECRET) {
        // Fallback to legacy v3 secret key if VP4 credentials are missing
        if (FLW_SECRET_KEY) {
            console.warn('[Flutterwave] VP4 credentials missing, falling back to v3 secret key.')
            return FLW_SECRET_KEY
        }
        throw new Error('[Flutterwave] No credentials configured. Set FLUTTERWAVE_CLIENT_ID and FLUTTERWAVE_CLIENT_SECRET.')
    }

    const params = new URLSearchParams()
    params.append('client_id', FLW_CLIENT_ID)
    params.append('client_secret', FLW_CLIENT_SECRET)
    params.append('grant_type', 'client_credentials')

    const response = await fetch(FLW_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    })

    const data = await response.json()

    if (!data.access_token) {
        console.error('[Flutterwave VP4] Token response:', data)
        // Fallback to v3 secret key if token fetch fails
        if (FLW_SECRET_KEY) {
            console.warn('[Flutterwave] VP4 token fetch failed, falling back to v3 secret key.')
            return FLW_SECRET_KEY
        }
        throw new Error('[Flutterwave VP4] Failed to obtain access token.')
    }

    // Cache the token (expires_in is in seconds, typically 600 = 10 min)
    _tokenCache = {
        token: data.access_token,
        expiresAt: now + (data.expires_in || 600) * 1000
    }

    console.log(`[Flutterwave VP4] New access token obtained. Expires in ${data.expires_in || 600}s.`)
    return _tokenCache.token
}

/**
 * Verify a transaction with Flutterwave VP4 API (OAuth 2.0 bearer token)
 * @param {string} transactionId - The Flutterwave transaction ID
 * @returns {Promise<{success: boolean, data: object, message: string}>}
 */
export async function verifyFlutterwaveTransaction(transactionId) {
    try {
        const accessToken = await getV4AccessToken()

        const response = await fetch(`${FLW_BASE_URL}/transactions/${transactionId}/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        const result = await response.json()

        if (result.status === 'success' && result.data?.status === 'successful') {
            return {
                success: true,
                data: result.data,
                message: 'Transaction verified successfully'
            }
        }

        return {
            success: false,
            data: result.data || null,
            message: result.message || 'Transaction verification failed'
        }
    } catch (error) {
        console.error('[Flutterwave] Verification error:', error)
        return {
            success: false,
            data: null,
            message: `Verification request failed: ${error.message}`
        }
    }
}

/**
 * Generate a unique payment reference for Flutterwave
 * Format: GCY-FLW-XXXXXXX
 */
export function generatePaymentRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let result = 'GCY-FLW-'
    for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

/**
 * Validate webhook signature from Flutterwave
 * @param {string} secretHash - The hash from the webhook header (verif-hash)
 * @returns {boolean}
 */
export function validateWebhookSignature(secretHash) {
    const webhookSecret = process.env.FLW_WEBHOOK_SECRET
    if (!webhookSecret) {
        console.warn('[Flutterwave] No webhook secret configured')
        return false
    }
    return secretHash === webhookSecret
}
